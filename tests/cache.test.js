/**
 * Tests for the Redis caching layer (src/lib/cache.js).
 *
 * These tests mock the Redis client returned by getRedis() to verify:
 *   1. withCache returns cached data on a cache hit (no fetcher call).
 *   2. withCache calls the fetcher on a cache miss and stores the result.
 *   3. withCache falls through to the fetcher when Redis throws.
 *   4. invalidateCache deletes exact keys with DEL.
 *   5. invalidateCache resolves wildcard patterns via SCAN + DEL.
 *   6. invalidateCache swallows errors silently.
 *   7. Cache integration in services: admin dashboard, student dashboard,
 *      student applications, and company applications.
 *   8. Cache invalidation triggers after mutations: applyToCompany,
 *      updateApplicationStatus, createCompanyAsAdmin, closeCompanyAsAdmin.
 */

const bcrypt = require('bcryptjs');
const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

// ── Mock Redis ──────────────────────────────────────────────────────────────
// Create a fake Redis client whose methods are Jest spies.
// All tests share this object, and each test resets the spies via clearAllMocks.
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  scan: jest.fn(),
};

// Mock the redis module so that getRedis() returns our spy object
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: () => mockRedisClient,
}));

function makeRequest(url, { method = 'GET', headers = {}, body } = {}) {
  const init = { method, headers };
  if (body) init.body = JSON.stringify(body);
  return new Request(url, init);
}

// ── Seed Helpers ────────────────────────────────────────────────────────────
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

  const studentProfile = await StudentProfile.create({
    userId: studentUser._id,
    enrollmentNumber: 'ENR001',
    branch: 'CSE',
    cgpa: 7.5,
    backlogCount: 0,
    mobileNumber: '9876543218',
  });

  return { admin, studentUser, studentProfile };
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

async function createApplication({ studentProfileId, companyId, status, appliedAt }) {
  const { default: Application } = await import('@/models/Application');
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

// ═════════════════════════════════════════════════════════════════════════════
// 1. Unit Tests — withCache & invalidateCache (pure logic, no DB)
// ═════════════════════════════════════════════════════════════════════════════
describe('Cache utility — unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.set.mockResolvedValue('OK');
    mockRedisClient.del.mockResolvedValue(1);
    mockRedisClient.scan.mockResolvedValue([0, []]);
  });

  test('withCache returns cached data on cache hit (fetcher NOT called)', async () => {
    const { withCache } = await import('@/lib/cache');

    const cachedPayload = { total: 42 };
    mockRedisClient.get.mockResolvedValue(cachedPayload);

    const fetcher = jest.fn();
    const result = await withCache('test:key', 60, fetcher);

    expect(result).toEqual(cachedPayload);
    expect(fetcher).not.toHaveBeenCalled();
    expect(mockRedisClient.get).toHaveBeenCalledWith('test:key');
    expect(mockRedisClient.set).not.toHaveBeenCalled();
  });

  test('withCache calls fetcher on cache miss and stores result with TTL', async () => {
    const { withCache } = await import('@/lib/cache');

    mockRedisClient.get.mockResolvedValue(null);

    const freshData = { students: 10, placed: 3 };
    const fetcher = jest.fn().mockResolvedValue(freshData);

    const result = await withCache('test:miss', 120, fetcher);

    expect(result).toEqual(freshData);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'test:miss',
      JSON.stringify(freshData),
      { ex: 120 }
    );
  });

  test('withCache falls through to fetcher when redis.get() throws', async () => {
    const { withCache } = await import('@/lib/cache');

    mockRedisClient.get.mockRejectedValue(new Error('Redis down'));

    const freshData = { fallback: true };
    const fetcher = jest.fn().mockResolvedValue(freshData);

    const result = await withCache('test:error', 60, fetcher);

    expect(result).toEqual(freshData);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('withCache still returns data when redis.set() throws after fetcher', async () => {
    const { withCache } = await import('@/lib/cache');

    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.set.mockRejectedValue(new Error('Redis write fail'));

    const freshData = { data: 'important' };
    const fetcher = jest.fn().mockResolvedValue(freshData);

    const result = await withCache('test:set-fail', 60, fetcher);

    expect(result).toEqual(freshData);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('invalidateCache deletes exact keys in a single DEL call', async () => {
    const { invalidateCache } = await import('@/lib/cache');

    await invalidateCache('cache:admin:dashboard', 'cache:admin:students');

    expect(mockRedisClient.del).toHaveBeenCalledWith(
      'cache:admin:dashboard',
      'cache:admin:students'
    );
    expect(mockRedisClient.scan).not.toHaveBeenCalled();
  });

  test('invalidateCache resolves wildcard patterns via SCAN + DEL', async () => {
    const { invalidateCache } = await import('@/lib/cache');

    // Simulate SCAN returning keys in two batches
    mockRedisClient.scan
      .mockResolvedValueOnce([42, ['cache:student:dashboard:user1', 'cache:student:dashboard:user2']])
      .mockResolvedValueOnce([0, ['cache:student:dashboard:user3']]);

    await invalidateCache('cache:student:dashboard:*');

    expect(mockRedisClient.scan).toHaveBeenCalledTimes(2);
    expect(mockRedisClient.del).toHaveBeenCalledWith(
      'cache:student:dashboard:user1',
      'cache:student:dashboard:user2'
    );
    expect(mockRedisClient.del).toHaveBeenCalledWith(
      'cache:student:dashboard:user3'
    );
  });

  test('invalidateCache handles mix of exact keys and patterns', async () => {
    const { invalidateCache } = await import('@/lib/cache');

    mockRedisClient.scan.mockResolvedValue([0, ['cache:admin:apps:c1:all']]);

    await invalidateCache('cache:admin:dashboard', 'cache:admin:apps:*');

    // Exact key via DEL
    expect(mockRedisClient.del).toHaveBeenCalledWith('cache:admin:dashboard');
    // Pattern via SCAN + DEL
    expect(mockRedisClient.scan).toHaveBeenCalled();
    expect(mockRedisClient.del).toHaveBeenCalledWith('cache:admin:apps:c1:all');
  });

  test('invalidateCache swallows errors silently', async () => {
    const { invalidateCache } = await import('@/lib/cache');

    mockRedisClient.del.mockRejectedValue(new Error('Redis connection lost'));

    // Should not throw
    await expect(
      invalidateCache('cache:admin:dashboard')
    ).resolves.toBeUndefined();
  });

  test('invalidateCache skips SCAN DEL when no pattern-matched keys found', async () => {
    const { invalidateCache } = await import('@/lib/cache');

    mockRedisClient.scan.mockResolvedValue([0, []]);

    await invalidateCache('cache:student:apps:*');

    expect(mockRedisClient.scan).toHaveBeenCalledTimes(1);
    // DEL should NOT have been called (no exact keys, no matched pattern keys)
    expect(mockRedisClient.del).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. CACHE_KEYS shape tests
// ═════════════════════════════════════════════════════════════════════════════
describe('CACHE_KEYS constants', () => {
  test('CACHE_KEYS generates correct key formats', async () => {
    const { CACHE_KEYS } = await import('@/lib/cache');

    expect(CACHE_KEYS.ADMIN_DASHBOARD).toBe('cache:admin:dashboard');
    expect(CACHE_KEYS.ADMIN_STUDENTS).toBe('cache:admin:students');

    // Dynamic keys
    expect(CACHE_KEYS.STUDENT_DASHBOARD('user123')).toBe('cache:student:dashboard:user123');
    expect(CACHE_KEYS.STUDENT_APPLICATIONS('user456')).toBe('cache:student:apps:user456');

    // Admin applications with filters
    expect(CACHE_KEYS.ADMIN_APPLICATIONS('comp1', 'APPLIED')).toBe('cache:admin:apps:comp1:APPLIED');
    expect(CACHE_KEYS.ADMIN_APPLICATIONS(null, null)).toBe('cache:admin:apps:all:all');
    expect(CACHE_KEYS.ADMIN_APPLICATIONS(undefined, undefined)).toBe('cache:admin:apps:all:all');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. Integration Tests — Service-layer caching with real MongoDB
// ═════════════════════════════════════════════════════════════════════════════
describe('Cache integration — services with DB', () => {
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
    jest.clearAllMocks();

    // Default: cache miss (force DB fetch)
    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.set.mockResolvedValue('OK');
    mockRedisClient.del.mockResolvedValue(1);
    mockRedisClient.scan.mockResolvedValue([0, []]);
  });

  // ── Admin Dashboard ────────────────────────────────────────────────────
  test('Admin dashboard: first call hits DB and stores in cache', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/dashboard/route');

    const { admin, studentProfile } = await seedUsers();
    const company = await createCompany({ createdBy: admin._id });
    await createApplication({
      studentProfileId: studentProfile._id,
      companyId: company._id,
      status: 'APPLIED',
      appliedAt: new Date(),
    });

    const token = generateToken(admin);
    const req = makeRequest('http://localhost/api/admin/dashboard', {
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const payload = await res.json();
    expect(payload.success).toBe(true);
    expect(payload.data.totalApplications).toBe(1);
    expect(payload.data.totalStudents).toBe(1);

    // Should have tried cache first, then stored result
    expect(mockRedisClient.get).toHaveBeenCalledWith('cache:admin:dashboard');
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'cache:admin:dashboard',
      expect.any(String),
      { ex: 300 }
    );
  });

  test('Admin dashboard: returns cached data without DB query on cache hit', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/dashboard/route');

    const { admin } = await seedUsers();

    const cachedData = {
      totalStudents: 99,
      openCompanies: 5,
      totalApplications: 200,
      placedStudents: 50,
      statusCounts: { APPLIED: 100, SHORTLISTED: 50, REJECTED: 30, SELECTED: 20 },
      companyStats: [],
      branchWiseStats: [],
      selectionRate: 10,
    };
    mockRedisClient.get.mockResolvedValue(cachedData);

    const token = generateToken(admin);
    const req = makeRequest('http://localhost/api/admin/dashboard', {
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const payload = await res.json();
    expect(payload.data.totalStudents).toBe(99);
    expect(payload.data.totalApplications).toBe(200);

    // set should NOT have been called (cache hit = no DB fetch)
    expect(mockRedisClient.set).not.toHaveBeenCalled();
  });

  // ── Student Dashboard ──────────────────────────────────────────────────
  test('Student dashboard: cache key is per-user', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/student/dashboard/route');

    const { studentUser } = await seedUsers();

    const token = generateToken(studentUser);
    const req = makeRequest('http://localhost/api/student/dashboard', {
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const expectedKey = `cache:student:dashboard:${studentUser._id}`;
    expect(mockRedisClient.get).toHaveBeenCalledWith(expectedKey);
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      expectedKey,
      expect.any(String),
      { ex: 180 }
    );
  });

  // ── Student Applications ───────────────────────────────────────────────
  test('Student applications list: cached per-user with 2 min TTL', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/student/applications/route');

    const { admin, studentUser, studentProfile } = await seedUsers();
    const company = await createCompany({ createdBy: admin._id });
    await createApplication({
      studentProfileId: studentProfile._id,
      companyId: company._id,
      status: 'APPLIED',
      appliedAt: new Date(),
    });

    const token = generateToken(studentUser);
    const req = makeRequest('http://localhost/api/student/applications', {
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const expectedKey = `cache:student:apps:${studentUser._id}`;
    expect(mockRedisClient.get).toHaveBeenCalledWith(expectedKey);
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      expectedKey,
      expect.any(String),
      { ex: 120 }
    );
  });

  // ── Admin Applications ─────────────────────────────────────────────────
  test('Admin applications list: cached with companyId and status in key', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/applications/route');

    const { admin, studentProfile } = await seedUsers();
    const company = await createCompany({ createdBy: admin._id });
    await createApplication({
      studentProfileId: studentProfile._id,
      companyId: company._id,
      status: 'APPLIED',
      appliedAt: new Date(),
    });

    const companyIdStr = company._id.toString();
    const token = generateToken(admin);
    const req = makeRequest(
      `http://localhost/api/admin/applications?companyId=${companyIdStr}&status=APPLIED`,
      { headers: { authorization: `Bearer ${token}` } }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const expectedKey = `cache:admin:apps:${companyIdStr}:APPLIED`;
    expect(mockRedisClient.get).toHaveBeenCalledWith(expectedKey);
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      expectedKey,
      expect.any(String),
      { ex: 120 }
    );
  });

  // ── Admin Students ─────────────────────────────────────────────────────
  test('Admin students list: cached with 3 min TTL', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/students/route');

    const { admin } = await seedUsers();

    const token = generateToken(admin);
    const req = makeRequest('http://localhost/api/admin/students', {
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    expect(mockRedisClient.get).toHaveBeenCalledWith('cache:admin:students');
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'cache:admin:students',
      expect.any(String),
      { ex: 180 }
    );
  });

  // ── Cache Invalidation on Apply ────────────────────────────────────────
  test('applyToCompany invalidates relevant caches', async () => {
    const { applyToCompany } = await import('@/services/application.service');

    const { admin, studentUser, studentProfile } = await seedUsers();
    const company = await createCompany({ createdBy: admin._id });

    await applyToCompany({ userId: studentUser._id, companyId: company._id.toString() });

    // Should have called DEL with the student's caches and admin caches
    const delCalls = mockRedisClient.del.mock.calls.flat();
    expect(delCalls).toContain(`cache:student:dashboard:${studentUser._id}`);
    expect(delCalls).toContain(`cache:student:apps:${studentUser._id}`);
    expect(delCalls).toContain('cache:admin:dashboard');
    expect(delCalls).toContain('cache:admin:students');

    // Wildcard pattern for admin apps should trigger SCAN
    expect(mockRedisClient.scan).toHaveBeenCalled();
  });

  // ── Cache Invalidation on Status Update ────────────────────────────────
  test('updateApplicationStatus invalidates relevant caches', async () => {
    const { applyToCompany, updateApplicationStatus } = await import('@/services/application.service');

    const { admin, studentUser, studentProfile } = await seedUsers();
    const company = await createCompany({ createdBy: admin._id });

    const { applicationId } = await applyToCompany({
      userId: studentUser._id,
      companyId: company._id.toString(),
    });

    // Clear mocks after apply so we only check status update invalidation
    jest.clearAllMocks();
    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.set.mockResolvedValue('OK');
    mockRedisClient.del.mockResolvedValue(1);
    mockRedisClient.scan.mockResolvedValue([0, []]);

    await updateApplicationStatus({
      adminUserId: admin._id,
      applicationId: applicationId.toString(),
      newStatus: 'SHORTLISTED',
      remark: 'Good profile',
    });

    const delCalls = mockRedisClient.del.mock.calls.flat();
    expect(delCalls).toContain(`cache:student:dashboard:${studentUser._id}`);
    expect(delCalls).toContain(`cache:student:apps:${studentUser._id}`);
    expect(delCalls).toContain('cache:admin:dashboard');
    expect(delCalls).toContain('cache:admin:students');
    expect(mockRedisClient.scan).toHaveBeenCalled();
  });

  // ── Cache Invalidation on Company Create ───────────────────────────────
  test('createCompanyAsAdmin invalidates admin + student dashboard caches', async () => {
    const { createCompanyAsAdmin } = await import('@/services/company.service');

    const { admin } = await seedUsers();

    await createCompanyAsAdmin(admin._id, {
      name: 'New Corp',
      role: 'Backend Dev',
      ctc: 15,
      eligibleBranches: ['CSE'],
      minCgpa: 7.0,
      backlogCount: 0,
      applicationDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    });

    const delCalls = mockRedisClient.del.mock.calls.flat();
    expect(delCalls).toContain('cache:admin:dashboard');
    expect(delCalls).toContain('cache:admin:students');

    // Should SCAN for student dashboard wildcard
    expect(mockRedisClient.scan).toHaveBeenCalled();
  });

  // ── Cache Invalidation on Company Close ────────────────────────────────
  test('closeCompanyAsAdmin invalidates admin + student dashboard caches', async () => {
    const { closeCompanyAsAdmin } = await import('@/services/company.service');

    const { admin } = await seedUsers();
    const company = await createCompany({ createdBy: admin._id });

    // Clear mocks after setup
    jest.clearAllMocks();
    mockRedisClient.del.mockResolvedValue(1);
    mockRedisClient.scan.mockResolvedValue([0, []]);

    await closeCompanyAsAdmin(company._id.toString());

    const delCalls = mockRedisClient.del.mock.calls.flat();
    expect(delCalls).toContain('cache:admin:dashboard');
    expect(delCalls).toContain('cache:admin:students');
    expect(mockRedisClient.scan).toHaveBeenCalled();
  });

  // ── Graceful Degradation ───────────────────────────────────────────────
  test('API still works when Redis is completely unavailable', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/dashboard/route');

    const { admin } = await seedUsers();

    // Simulate total Redis failure
    mockRedisClient.get.mockRejectedValue(new Error('ECONNREFUSED'));
    mockRedisClient.set.mockRejectedValue(new Error('ECONNREFUSED'));

    const token = generateToken(admin);
    const req = makeRequest('http://localhost/api/admin/dashboard', {
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const payload = await res.json();
    expect(payload.success).toBe(true);
    // Data should still come from DB
    expect(typeof payload.data.totalStudents).toBe('number');
  });
});
