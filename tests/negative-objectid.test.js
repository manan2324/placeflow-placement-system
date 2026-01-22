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

  const passwordHash = await bcrypt.hash('pw', 4);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash,
    role: 'ADMIN',
    isActive: true,
  });

  const student = await User.create({
    name: 'Student',
    email: 'student@example.com',
    passwordHash,
    role: 'STUDENT',
    isActive: true,
  });

  return { admin, student };
}

describe('Negative ObjectId Tests', () => {
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

  test('PATCH /api/admin/applications/123/status -> 400 BAD_ID', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { PATCH } = await import('@/app/api/admin/applications/[id]/status/route');

    const { admin } = await seedAdminAndStudent();
    const token = generateToken(admin);

    const req = makeRequest('http://localhost/api/admin/applications/123/status', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      jsonBody: { status: 'SHORTLISTED' },
    });

    const res = await PATCH(req, { params: { id: '123' } });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('BAD_ID');
  });

  test('POST /api/student/apply/123 -> 400 BAD_ID', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/apply/[companyId]/route');

    const { student } = await seedAdminAndStudent();
    const token = generateToken(student);

    const req = makeRequest('http://localhost/api/student/apply/123', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await POST(req, { params: { companyId: '123' } });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('BAD_ID');
  });

  test('GET /api/admin/applications?companyId=123 -> 400 BAD_ID', async () => {
    const { generateToken } = await import('@/lib/jwt');
    const { GET } = await import('@/app/api/admin/applications/route');

    const { admin } = await seedAdminAndStudent();
    const token = generateToken(admin);

    const req = makeRequest('http://localhost/api/admin/applications?companyId=123', {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('BAD_ID');
  });
});
