const bcrypt = require('bcryptjs');

const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

function makeRequest(url, { method = 'GET', headers = {}, jsonBody } = {}) {
  const init = {
    method,
    headers: {
      ...(jsonBody ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (jsonBody !== undefined) {
    init.body = JSON.stringify(jsonBody);
  }

  return new Request(url, init);
}

async function seedAdminAndStudent() {
  const { default: User } = await import('@/models/User');
  const { default: StudentProfile } = await import('@/models/StudentProfile');

  const passwordHash = await bcrypt.hash('pw', 4);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash,
    role: 'ADMIN',
    isActive: true,
  });

  const studentUser = await User.create({
    name: 'Student',
    email: 'student@example.com',
    passwordHash,
    role: 'STUDENT',
    isActive: true,
  });

  const studentProfile = await StudentProfile.create({
    userId: studentUser._id,
    enrollmentNumber: 'ENR001',
    branch: 'CSE',
    cgpa: 7.5,
    backlogCount: 0,
    mobileNumber: '9876543217',
  });

  return { admin, studentUser, studentProfile };
}

async function createCompany({ createdBy, overrides = {} }) {
  const { default: Company } = await import('@/models/Company');

  const base = {
    name: 'Acme Corp',
    role: 'SDE',
    ctc: 10,
    eligibleBranches: ['CSE'],
    minCgpa: 7.0,
    backlogCount: 10,
    applicationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'OPEN',
    createdBy,
  };

  return Company.create({ ...base, ...overrides });
}

describe('Eligibility & Apply Flow Tests', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
    await startInMemoryMongo();
    await resetMongooseConnection();

    const { default: connectDB } = await import('@/lib/mongodb');
    await connectDB();
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  test('Apply Success: eligible student + company open + deadline valid -> application created, status=APPLIED, snapshot stored', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { default: Application } = await import('@/models/Application');
    const { POST } = await import('@/app/api/student/apply/[companyId]/route');

    const { admin, studentUser, studentProfile } = await seedAdminAndStudent();
    const company = await createCompany({ createdBy: admin._id });

    const token = generateToken(studentUser);

    const req = makeRequest(`http://localhost/api/student/apply/${company._id}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await POST(req, { params: { companyId: company._id.toString() } });
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty('applicationId');

    const app = await Application.findById(body.applicationId);
    expect(app).toBeTruthy();
    expect(app.status).toBe('APPLIED');
    expect(app.studentId.toString()).toBe(studentProfile._id.toString());
    expect(app.companyId.toString()).toBe(company._id.toString());

    expect(app.snapshot).toEqual(
      expect.objectContaining({
        branch: studentProfile.branch,
        cgpa: studentProfile.cgpa,
        backlogCount: studentProfile.backlogCount,
      })
    );
  });

  test('Duplicate Apply: two parallel requests -> one success, one DUPLICATE_APPLICATION', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/apply/[companyId]/route');

    const { admin, studentUser } = await seedAdminAndStudent();
    const company = await createCompany({ createdBy: admin._id });

    const token = generateToken(studentUser);

    const makeApplyCall = () => {
      const req = makeRequest(`http://localhost/api/student/apply/${company._id}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });
      return POST(req, { params: { companyId: company._id.toString() } });
    };

    const [r1, r2] = await Promise.all([makeApplyCall(), makeApplyCall()]);

    const statuses = [r1.status, r2.status].sort();
    // Expect exactly one 201 and one conflict
    expect(statuses).toEqual([201, 409]);

    const conflictRes = r1.status === 409 ? r1 : r2;
    const conflictBody = await conflictRes.json();
    expect(conflictBody.code || conflictBody.errorCode).toBe('DUPLICATE_APPLICATION');
  });

  test('Deadline Passed -> code DEADLINE_PASSED', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/apply/[companyId]/route');

    const { admin, studentUser } = await seedAdminAndStudent();
    const company = await createCompany({
      createdBy: admin._id,
      overrides: {
        applicationDeadline: new Date(Date.now() - 60 * 1000),
      },
    });

    const token = generateToken(studentUser);

    const req = makeRequest(`http://localhost/api/student/apply/${company._id}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await POST(req, { params: { companyId: company._id.toString() } });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('DEADLINE_PASSED');
  });

  test('CGPA Boundary: cgpa exactly = minCgpa -> must pass', async () => {
    const { default: StudentProfile } = await import('@/models/StudentProfile');
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/apply/[companyId]/route');

    const { admin, studentUser, studentProfile } = await seedAdminAndStudent();

    // Set cgpa exactly at the boundary
    await StudentProfile.updateOne({ _id: studentProfile._id }, { cgpa: 7.0 });

    const company = await createCompany({
      createdBy: admin._id,
      overrides: { minCgpa: 7.0 },
    });

    const token = generateToken(studentUser);

    const req = makeRequest(`http://localhost/api/student/apply/${company._id}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await POST(req, { params: { companyId: company._id.toString() } });
    expect(res.status).toBe(201);
  });

  test('Branch Mismatch -> code BRANCH_NOT_ELIGIBLE', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/apply/[companyId]/route');

    const { admin, studentUser } = await seedAdminAndStudent();
    const company = await createCompany({
      createdBy: admin._id,
      overrides: { eligibleBranches: ['ECE'] },
    });

    const token = generateToken(studentUser);

    const req = makeRequest(`http://localhost/api/student/apply/${company._id}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await POST(req, { params: { companyId: company._id.toString() } });
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('BRANCH_NOT_ELIGIBLE');
  });

  test('Backlog Rule: backlogCount=0 and student.backlogCount=1 -> reject', async () => {
    const { default: StudentProfile } = await import('@/models/StudentProfile');
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/apply/[companyId]/route');

    const { admin, studentUser, studentProfile } = await seedAdminAndStudent();

    await StudentProfile.updateOne({ _id: studentProfile._id }, { backlogCount: 1 });

    const company = await createCompany({
      createdBy: admin._id,
      overrides: { backlogCount: 0 },
    });

    const token = generateToken(studentUser);

    const req = makeRequest(`http://localhost/api/student/apply/${company._id}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await POST(req, { params: { companyId: company._id.toString() } });
    expect(res.status).toBe(403);

    const body = await res.json();
    // Code name isn't shown in the screenshot, but we still validate a stable API code.
    expect(body.code || body.errorCode).toBe('NOT_ELIGIBLE_BACKLOG');
  });
});
