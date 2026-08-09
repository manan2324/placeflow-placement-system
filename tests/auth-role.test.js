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

describe('Auth & Role Tests (security)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
    await startInMemoryMongo();

    // Ensure mongoose uses the in-memory URI even if other tests ran.
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

  test('Login with wrong password -> 401', async () => {
    const { default: User } = await import('@/models/User');
    const { POST } = await import('@/app/api/auth/login/route');

    const passwordHash = await bcrypt.hash('correct-password', 4);
    await User.create({
      name: 'Student One',
      email: 'student1@example.com', 
      passwordHash,
      role: 'STUDENT',
      isActive: true,
      isApproved: true,
    });

    const req = makeRequest('http://localhost/api/auth/login', {
      method: 'POST',
      jsonBody: { email: 'student1@example.com', password: 'wrong-password' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('Login inactive user -> 403', async () => {
    const { default: User } = await import('@/models/User');
    const { POST } = await import('@/app/api/auth/login/route');

    const passwordHash = await bcrypt.hash('correct-password', 4);
    await User.create({
      name: 'Inactive Student',
      email: 'inactive@example.com',
      passwordHash,
      role: 'STUDENT',
      isActive: false,
    });

    const req = makeRequest('http://localhost/api/auth/login', {
      method: 'POST',
      jsonBody: { email: 'inactive@example.com', password: 'correct-password' },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  test('Student accessing admin API -> 403', async () => {
    const { default: User } = await import('@/models/User');
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/dashboard/route');

    const passwordHash = await bcrypt.hash('pw', 4);
    const student = await User.create({
      name: 'Student Two',
      email: 'student2@example.com',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    });

    const token = generateToken(student);

    const req = makeRequest('http://localhost/api/admin/dashboard', {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  test('No token on protected route -> 401', async () => {
    const { GET } = await import('@/app/api/student/profile/route');

    const req = makeRequest('http://localhost/api/student/profile', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test('Token of deleted user -> 401', async () => {
    const { default: User } = await import('@/models/User');
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/student/profile/route');

    const passwordHash = await bcrypt.hash('pw', 4);
    const user = await User.create({
      name: 'To Be Deleted',
      email: 'deleted@example.com',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    });

    const token = generateToken(user);
    await User.deleteOne({ _id: user._id });

    const req = makeRequest('http://localhost/api/student/profile', {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
