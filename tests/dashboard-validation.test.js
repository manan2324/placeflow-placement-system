const bcrypt = require('bcryptjs');

const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

function makeRequest(url, { method = 'GET', headers = {} } = {}) {
  return new Request(url, { method, headers });
}

async function seedUsers() {
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

  const student2User = await User.create({
    name: 'Student2',
    email: 'student2@example.com',
    passwordHash,
    role: 'STUDENT',
    isActive: true,
  });

  const studentProfile = await StudentProfile.create({
    userId: studentUser._id,
    enrollmentNumber: 'ENR001',
    branch: 'CSE',
    cgpa: 7.0,
    backlogCount: 1,
  });

  const student2Profile = await StudentProfile.create({
    userId: student2User._id,
    enrollmentNumber: 'ENR002',
    branch: 'ECE',
    cgpa: 8.5,
    backlogCount: 0,
  });

  return { admin, studentUser, studentProfile, student2User, student2Profile };
}

async function createCompany({ createdBy, overrides = {} }) {
  const { default: Company } = await import('@/models/Company');

  const base = {
    name: `Company-${Math.random().toString(16).slice(2)}`,
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

async function createNotificationForUser({ userId, createdAt }) {
  const { default: Notification } = await import('@/models/Notification');

  return Notification.create({
    userId,
    title: 'Test Notification',
    message: `Created at ${createdAt.toISOString()}`,
    createdAt,
  });
}

async function createApplication({ studentProfileId, companyId, status, appliedAt }) {
  const { default: Application } = await import('@/models/Application');

  // Snapshot fields must be present
  const { default: StudentProfile } = await import('@/models/StudentProfile');
  const student = await StudentProfile.findById(studentProfileId);

  return Application.create({
    studentId: studentProfileId,
    companyId,
    status,
    snapshot: {
      branch: student.branch,
      cgpa: student.cgpa,
      backlogCount: student.backlogCount,
    },
    appliedAt,
  });
}

describe('Dashboard Validation', () => {
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

  test('Student dashboard invariants: statusCounts sum == applications length; eligibleCompanies <= openCompanies; recentApplications <= 5; notifications sorted DESC', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/student/dashboard/route');
    const { default: Company } = await import('@/models/Company');

    const { admin, studentUser, studentProfile } = await seedUsers();

    // Create some OPEN but NOT eligible companies (to enforce eligible < open)
    await createCompany({ createdBy: admin._id, overrides: { backlogCount: 0 } }); // not eligible: backlog
    await createCompany({ createdBy: admin._id, overrides: { eligibleBranches: ['ECE'] } }); // not eligible: branch
    await createCompany({ createdBy: admin._id, overrides: { minCgpa: 9.0 } }); // not eligible: cgpa

    // Create eligible/open companies to apply to
    const companies = [];
    for (let i = 0; i < 6; i += 1) {
      // ensure eligible for backlog student
      // unique name for unique index
      companies.push(
        await createCompany({
          createdBy: admin._id,
          overrides: { name: `Eligible-${i}-${Date.now()}`, backlogCount: 10, eligibleBranches: ['CSE'], minCgpa: 7.0 },
        })
      );
    }

    // Create 6 applications with different statuses and timestamps
    const now = Date.now();
    const statuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'APPLIED', 'SHORTLISTED'];
    const appliedAts = statuses.map((_, idx) => new Date(now - idx * 60 * 1000)); // descending by idx

    for (let i = 0; i < 6; i += 1) {
      await createApplication({
        studentProfileId: studentProfile._id,
        companyId: companies[i]._id,
        status: statuses[i],
        appliedAt: appliedAts[i],
      });
    }

    // Create 7 notifications with increasing createdAt; response should return latest 5 sorted desc
    const notifTimes = Array.from({ length: 7 }, (_, i) => new Date(now - i * 1000));
    // Create out-of-order to ensure sort is by createdAt, not insertion
    await createNotificationForUser({ userId: studentUser._id, createdAt: notifTimes[3] });
    await createNotificationForUser({ userId: studentUser._id, createdAt: notifTimes[0] });
    await createNotificationForUser({ userId: studentUser._id, createdAt: notifTimes[6] });
    await createNotificationForUser({ userId: studentUser._id, createdAt: notifTimes[2] });
    await createNotificationForUser({ userId: studentUser._id, createdAt: notifTimes[5] });
    await createNotificationForUser({ userId: studentUser._id, createdAt: notifTimes[1] });
    await createNotificationForUser({ userId: studentUser._id, createdAt: notifTimes[4] });

    const token = generateToken(studentUser);
    const req = makeRequest('http://localhost/api/student/dashboard', {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const payload = await res.json();
    expect(payload).toHaveProperty('success', true);

    const { data } = payload;

    // Eligible must be <= open
    expect(data.eligibleCompanies).toBeLessThanOrEqual(data.openCompanies);

    // Status counts sum must equal applications length
    const counts = data.statusCounts;
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(data.appliedCompanies);
    expect(data.appliedCompanies).toBe(6);

    // Recent applications <= 5
    expect(Array.isArray(data.recentApplications)).toBe(true);
    expect(data.recentApplications.length).toBeLessThanOrEqual(5);
    expect(data.recentApplications.length).toBe(5);

    // Recent applications should be newest first (appliedAt desc)
    const recentAppliedAts = data.recentApplications.map((a) => new Date(a.appliedAt).getTime());
    for (let i = 1; i < recentAppliedAts.length; i += 1) {
      expect(recentAppliedAts[i - 1]).toBeGreaterThanOrEqual(recentAppliedAts[i]);
    }

    // Notifications sorted DESC and <= 5
    expect(Array.isArray(data.recentNotifications)).toBe(true);
    expect(data.recentNotifications.length).toBeLessThanOrEqual(5);

    const notifCreatedAts = data.recentNotifications.map((n) => new Date(n.createdAt).getTime());
    for (let i = 1; i < notifCreatedAts.length; i += 1) {
      expect(notifCreatedAts[i - 1]).toBeGreaterThanOrEqual(notifCreatedAts[i]);
    }

    // Sanity: openCompanies equals DB open+deadline>now (optional but useful)
    const expectedOpen = await Company.countDocuments({
      status: 'OPEN',
      applicationDeadline: { $gt: new Date() },
    });
    expect(data.openCompanies).toBe(expectedOpen);
  });

  test('Admin dashboard invariants: sum(statusCounts) == totalApplications; companyStats applicants match DB count', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/dashboard/route');
    const { default: Application } = await import('@/models/Application');

    const { admin, studentProfile, student2Profile } = await seedUsers();

    // Create 3 companies
    const c1 = await createCompany({ createdBy: admin._id, overrides: { name: `C1-${Date.now()}`, eligibleBranches: ['CSE', 'ECE'], backlogCount: 10 } });
    const c2 = await createCompany({ createdBy: admin._id, overrides: { name: `C2-${Date.now()}`, eligibleBranches: ['CSE', 'ECE'], backlogCount: 10 } });
    const c3 = await createCompany({ createdBy: admin._id, overrides: { name: `C3-${Date.now()}`, eligibleBranches: ['CSE', 'ECE'], backlogCount: 10 } });

    // 5 applications with controlled statuses
    await createApplication({ studentProfileId: studentProfile._id, companyId: c1._id, status: 'APPLIED', appliedAt: new Date(Date.now() - 10000) });
    await createApplication({ studentProfileId: student2Profile._id, companyId: c1._id, status: 'SELECTED', appliedAt: new Date(Date.now() - 9000) });
    await createApplication({ studentProfileId: studentProfile._id, companyId: c2._id, status: 'SHORTLISTED', appliedAt: new Date(Date.now() - 8000) });
    await createApplication({ studentProfileId: student2Profile._id, companyId: c2._id, status: 'REJECTED', appliedAt: new Date(Date.now() - 7000) });
    await createApplication({ studentProfileId: student2Profile._id, companyId: c3._id, status: 'APPLIED', appliedAt: new Date(Date.now() - 6000) });

    const token = generateToken(admin);
    const req = makeRequest('http://localhost/api/admin/dashboard', {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const payload = await res.json();
    expect(payload).toHaveProperty('success', true);

    const { data } = payload;

    const total = data.totalApplications;
    const sum = Object.values(data.statusCounts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(total);

    // Company applicants must match DB counts
    expect(Array.isArray(data.companyStats)).toBe(true);
    for (const stat of data.companyStats) {
      const actual = await Application.countDocuments({ companyId: stat.companyId });
      expect(stat.applicants).toBe(actual);
    }

    // Extra guard: totalApplications matches DB
    const dbTotal = await Application.countDocuments();
    expect(total).toBe(dbTotal);
  });
});
