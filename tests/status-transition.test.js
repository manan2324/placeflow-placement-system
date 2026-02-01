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

async function seedActors() {
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
    cgpa: 8.0,
    backlogCount: 0,
  });

  return { admin, studentUser, studentProfile };
}

async function seedCompanyAndApplication({ admin, studentProfile, initialStatus }) {
  const { default: Company } = await import('@/models/Company');
  const { default: Application } = await import('@/models/Application');

  const company = await Company.create({
    name: 'Acme Corp',
    role: 'SDE',
    ctc: 10,
    eligibleBranches: ['CSE'],
    minCgpa: 7.0,
    backlogCount: 10,
    applicationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'OPEN',
    createdBy: admin._id,
  });

  const application = await Application.create({
    studentId: studentProfile._id,
    companyId: company._id,
    status: initialStatus,
    snapshot: {
      branch: studentProfile.branch,
      cgpa: studentProfile.cgpa,
      backlogCount: studentProfile.backlogCount,
    },
    appliedAt: new Date(),
  });

  return { company, application };
}

async function patchStatus({ adminToken, applicationId, status }) {
  const { PATCH } = await import('@/app/api/admin/applications/[id]/status/route');

  const req = makeRequest(`http://localhost/api/admin/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${adminToken}` },
    jsonBody: { status },
  });

  return PATCH(req, { params: { id: applicationId.toString() } });
}

describe('Status Transition Tests', () => {
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

  test('APPLIED -> SHORTLISTED = OK; status updated; log created; notification created', async () => {
    const { default: Application } = await import('@/models/Application');
    const { default: ApplicationLog } = await import('@/models/ApplicationLog');
    const { default: Notification } = await import('@/models/Notification');
    const { generateToken } = await import('@/lib/jwt');

    const { admin, studentUser, studentProfile } = await seedActors();
    const { application } = await seedCompanyAndApplication({ admin, studentProfile, initialStatus: 'APPLIED' });

    const adminToken = generateToken(admin);

    const beforeLogs = await ApplicationLog.countDocuments({ applicationId: application._id });
    const beforeNotifs = await Notification.countDocuments({ userId: studentUser._id });

    const res = await patchStatus({ adminToken, applicationId: application._id, status: 'SHORTLISTED' });
    expect(res.status).toBe(200);

    const updated = await Application.findById(application._id);
    expect(updated.status).toBe('SHORTLISTED');

    const afterLogs = await ApplicationLog.find({ applicationId: application._id }).sort({ changedAt: 1 });
    expect(afterLogs.length).toBe(beforeLogs + 1);
    expect(afterLogs[afterLogs.length - 1]).toEqual(
      expect.objectContaining({
        applicationId: application._id,
        oldStatus: 'APPLIED',
        newStatus: 'SHORTLISTED',
        changedBy: admin._id,
      })
    );

    const afterNotifs = await Notification.find({ userId: studentUser._id }).sort({ createdAt: 1 });
    expect(afterNotifs.length).toBe(beforeNotifs + 1);
    expect(afterNotifs[afterNotifs.length - 1]).toEqual(
      expect.objectContaining({
        userId: studentUser._id,
        title: 'Application Status Updated',
      })
    );
  });

  test('APPLIED -> SELECTED = X (invalid transition)', async () => {
    const { default: Application } = await import('@/models/Application');
    const { default: ApplicationLog } = await import('@/models/ApplicationLog');
    const { default: Notification } = await import('@/models/Notification');
    const { generateToken } = await import('@/lib/jwt');

    const { admin, studentUser, studentProfile } = await seedActors();
    const { application } = await seedCompanyAndApplication({ admin, studentProfile, initialStatus: 'APPLIED' });

    const adminToken = generateToken(admin);

    const beforeLogs = await ApplicationLog.countDocuments({ applicationId: application._id });
    const beforeNotifs = await Notification.countDocuments({ userId: studentUser._id });

    const res = await patchStatus({ adminToken, applicationId: application._id, status: 'SELECTED' });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('INVALID_STATUS_TRANSITION');

    const unchanged = await Application.findById(application._id);
    expect(unchanged.status).toBe('APPLIED');

    expect(await ApplicationLog.countDocuments({ applicationId: application._id })).toBe(beforeLogs);
    expect(await Notification.countDocuments({ userId: studentUser._id })).toBe(beforeNotifs);
  });

  test('SHORTLISTED -> REJECTED = OK; status updated; log created; notification created', async () => {
    const { default: Application } = await import('@/models/Application');
    const { default: ApplicationLog } = await import('@/models/ApplicationLog');
    const { default: Notification } = await import('@/models/Notification');
    const { generateToken } = await import('@/lib/jwt');

    const { admin, studentUser, studentProfile } = await seedActors();
    const { application } = await seedCompanyAndApplication({ admin, studentProfile, initialStatus: 'SHORTLISTED' });

    const adminToken = generateToken(admin);

    const beforeLogs = await ApplicationLog.countDocuments({ applicationId: application._id });
    const beforeNotifs = await Notification.countDocuments({ userId: studentUser._id });

    const res = await patchStatus({ adminToken, applicationId: application._id, status: 'REJECTED' });
    expect(res.status).toBe(200);

    const updated = await Application.findById(application._id);
    expect(updated.status).toBe('REJECTED');

    expect(await ApplicationLog.countDocuments({ applicationId: application._id })).toBe(beforeLogs + 1);
    expect(await Notification.countDocuments({ userId: studentUser._id })).toBe(beforeNotifs + 1);
  });

  test('SELECTED -> APPLIED = X (invalid transition)', async () => {
    const { default: Application } = await import('@/models/Application');
    const { default: ApplicationLog } = await import('@/models/ApplicationLog');
    const { default: Notification } = await import('@/models/Notification');
    const { generateToken } = await import('@/lib/jwt');

    const { admin, studentUser, studentProfile } = await seedActors();
    const { application } = await seedCompanyAndApplication({ admin, studentProfile, initialStatus: 'SELECTED' });

    const adminToken = generateToken(admin);

    const beforeLogs = await ApplicationLog.countDocuments({ applicationId: application._id });
    const beforeNotifs = await Notification.countDocuments({ userId: studentUser._id });

    const res = await patchStatus({ adminToken, applicationId: application._id, status: 'APPLIED' });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('INVALID_STATUS_TRANSITION');

    const unchanged = await Application.findById(application._id);
    expect(unchanged.status).toBe('SELECTED');

    expect(await ApplicationLog.countDocuments({ applicationId: application._id })).toBe(beforeLogs);
    expect(await Notification.countDocuments({ userId: studentUser._id })).toBe(beforeNotifs);
  });

  test('REJECTED -> SHORTLISTED = X (invalid transition)', async () => {
    const { default: Application } = await import('@/models/Application');
    const { default: ApplicationLog } = await import('@/models/ApplicationLog');
    const { default: Notification } = await import('@/models/Notification');
    const { generateToken } = await import('@/lib/jwt');

    const { admin, studentUser, studentProfile } = await seedActors();
    const { application } = await seedCompanyAndApplication({ admin, studentProfile, initialStatus: 'REJECTED' });

    const adminToken = generateToken(admin);

    const beforeLogs = await ApplicationLog.countDocuments({ applicationId: application._id });
    const beforeNotifs = await Notification.countDocuments({ userId: studentUser._id });

    const res = await patchStatus({ adminToken, applicationId: application._id, status: 'SHORTLISTED' });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('INVALID_STATUS_TRANSITION');

    const unchanged = await Application.findById(application._id);
    expect(unchanged.status).toBe('REJECTED');

    expect(await ApplicationLog.countDocuments({ applicationId: application._id })).toBe(beforeLogs);
    expect(await Notification.countDocuments({ userId: studentUser._id })).toBe(beforeNotifs);
  });
});
