const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

function makeRequest(url, { method = 'GET', headers = {} } = {}) {
  return new Request(url, {
    method,
    headers,
  });
}

async function seedTwoStudentsAndAdmin() {
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

  const studentAUser = await User.create({
    name: 'Student A',
    email: 'studenta@example.com',
    passwordHash,
    role: 'STUDENT',
    isActive: true,
  });

  const studentBUser = await User.create({
    name: 'Student B',
    email: 'studentb@example.com',
    passwordHash,
    role: 'STUDENT',
    isActive: true,
  });

  const studentAProfile = await StudentProfile.create({
    userId: studentAUser._id,
    enrollmentNumber: 'ENRA',
    branch: 'CSE',
    cgpa: 8.1,
    hasBacklog: false,
  });

  const studentBProfile = await StudentProfile.create({
    userId: studentBUser._id,
    enrollmentNumber: 'ENRB',
    branch: 'CSE',
    cgpa: 8.2,
    hasBacklog: false,
  });

  return { admin, studentAUser, studentBUser, studentAProfile, studentBProfile };
}

async function seedCompaniesAndApplications({ admin, studentAProfile, studentBProfile }) {
  const { default: Company } = await import('@/models/Company');
  const { default: Application } = await import('@/models/Application');

  const companyA = await Company.create({
    name: 'Company A',
    role: 'SDE',
    ctc: 10,
    eligibleBranches: ['CSE'],
    minCgpa: 7.0,
    backlogAllowed: true,
    applicationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'OPEN',
    createdBy: admin._id,
  });

  const companyB = await Company.create({
    name: 'Company B',
    role: 'SDE',
    ctc: 12,
    eligibleBranches: ['CSE'],
    minCgpa: 7.0,
    backlogAllowed: true,
    applicationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'OPEN',
    createdBy: admin._id,
  });

  const appA = await Application.create({
    studentId: studentAProfile._id,
    companyId: companyA._id,
    status: 'APPLIED',
    snapshot: {
      branch: studentAProfile.branch,
      cgpa: studentAProfile.cgpa,
      hasBacklog: studentAProfile.hasBacklog,
    },
    appliedAt: new Date(),
  });

  const appB = await Application.create({
    studentId: studentBProfile._id,
    companyId: companyB._id,
    status: 'APPLIED',
    snapshot: {
      branch: studentBProfile.branch,
      cgpa: studentBProfile.cgpa,
      hasBacklog: studentBProfile.hasBacklog,
    },
    appliedAt: new Date(),
  });

  return { companyA, companyB, appA, appB };
}

describe('Ownership Protection', () => {
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

  test('Student cannot access other student applications by id (403 or empty / no route)', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/student/applications/route');

    const { admin, studentAUser, studentBUser, studentAProfile, studentBProfile } = await seedTwoStudentsAndAdmin();
    const { appA, appB } = await seedCompaniesAndApplications({ admin, studentAProfile, studentBProfile });

    // Student A requests "student applications" endpoint.
    const tokenA = generateToken(studentAUser);
    const reqA = makeRequest('http://localhost/api/student/applications', {
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    });

    const resA = await GET(reqA);
    expect(resA.status).toBe(200);

    const bodyA = await resA.json();
    expect(Array.isArray(bodyA)).toBe(true);

    // No data leak: student A should not see student B applicationId
    const returnedIds = bodyA.map((x) => x.applicationId?.toString());
    expect(returnedIds).toContain(appA._id.toString());
    expect(returnedIds).not.toContain(appB._id.toString());

    // Optional: if a route like /api/student/applications/{otherStudentId} exists,
    // it must not leak data (should be 403 or empty).
    const dynamicRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'student', 'applications', '[otherStudentId]', 'route.js');
    const hasDynamicRoute = fs.existsSync(dynamicRoutePath);

    if (hasDynamicRoute) {
      const otherStudentId = studentBUser._id.toString();
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const dyn = await import('@/app/api/student/applications/[otherStudentId]/route');
      const dynGET = dyn.GET;

      const reqOther = makeRequest(`http://localhost/api/student/applications/${otherStudentId}`, {
        method: 'GET',
        headers: { authorization: `Bearer ${tokenA}` },
      });

      const resOther = await dynGET(reqOther, { params: { otherStudentId } });
      expect([200, 403, 404]).toContain(resOther.status);

      if (resOther.status === 200) {
        const bodyOther = await resOther.json();
        // "empty" is allowed by spec
        expect(Array.isArray(bodyOther)).toBe(true);
        const otherIds = bodyOther.map((x) => x.applicationId?.toString());
        expect(otherIds).not.toContain(appB._id.toString());
      }

      if (resOther.status === 403) {
        const bodyOther = await resOther.json();
        // Ensure response doesn't include application data
        expect(bodyOther).not.toHaveProperty('data');
      }
    }
  });
});
