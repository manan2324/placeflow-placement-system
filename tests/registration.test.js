const bcrypt = require('bcryptjs');

const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

let testIpCounter = 0;

function nextIp() {
  testIpCounter += 1;
  return `10.0.${Math.floor(testIpCounter / 256)}.${testIpCounter % 256}`;
}

function makeRequest(url, { method = 'GET', headers = {}, jsonBody } = {}) {
  const init = {
    method,
    headers: {
      'x-forwarded-for': nextIp(),
      ...(jsonBody ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (jsonBody !== undefined) {
    init.body = JSON.stringify(jsonBody);
  }

  return new Request(url, init);
}

const validPayload = {
  name: 'Test Student',
  email: 'test.student@example.com',
  password: 'secure123',
  enrollmentNumber: 'ENR-001',
  branch: 'CSE',
  cgpa: 8.5,
  backlogCount: 0,
  mobileNumber: '9876543210',
};

describe('Registration Endpoint Tests', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
    await startInMemoryMongo();
    await resetMongooseConnection();

    const { default: connectDB } = await import('@/lib/mongodb');
    await connectDB();
    await import('@/models/User');
    await import('@/models/StudentProfile');
    const { syncIndexes } = require('./helpers/mongo');
    await syncIndexes();
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  // --- Success Cases ---

  test('Valid registration -> 201 with userId', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: validPayload,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.message).toBe('Student registered successfully.');
    expect(body.userId).toBeTruthy();
  });

  test('Registration creates both User and StudentProfile', async () => {
    const { default: User } = await import('@/models/User');
    const { default: StudentProfile } = await import('@/models/StudentProfile');
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: validPayload,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();

    const user = await User.findById(body.userId);
    expect(user).toBeTruthy();
    expect(user.email).toBe(validPayload.email);
    expect(user.role).toBe('STUDENT');

    const profile = await StudentProfile.findOne({ userId: body.userId });
    expect(profile).toBeTruthy();
    expect(profile.enrollmentNumber).toBe(validPayload.enrollmentNumber);
    expect(profile.branch).toBe(validPayload.branch);
    expect(profile.mobileNumber).toBe(validPayload.mobileNumber);
  });

  test('New user isApproved defaults to false', async () => {
    const { default: User } = await import('@/models/User');
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: validPayload,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    const user = await User.findById(body.userId);
    expect(user.isApproved).toBe(false);
  });

  // --- Conflict / Duplicate Cases ---

  test('Duplicate email -> 409 EMAIL_EXISTS', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    // First registration
    const req1 = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: validPayload,
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(201);

    // Second registration with same email
    const req2 = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: {
        ...validPayload,
        enrollmentNumber: 'ENR-002',
        mobileNumber: '9876543211',
      },
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(409);

    const body = await res2.json();
    expect(body.code || body.errorCode).toBe('EMAIL_EXISTS');
  });

  test('Duplicate enrollment number -> 409 ENROLLMENT_EXISTS', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req1 = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: validPayload,
    });
    await POST(req1);

    const req2 = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: {
        ...validPayload,
        email: 'other@example.com',
        mobileNumber: '9876543211',
      },
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(409);

    const body = await res2.json();
    expect(body.code || body.errorCode).toBe('ENROLLMENT_EXISTS');
  });

  test('Duplicate mobile number -> 409 MOBILE_EXISTS', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req1 = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: validPayload,
    });
    await POST(req1);

    const req2 = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: {
        ...validPayload,
        email: 'other@example.com',
        enrollmentNumber: 'ENR-002',
      },
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(409);

    const body = await res2.json();
    expect(body.code || body.errorCode).toBe('MOBILE_EXISTS');
  });

  // --- Validation Cases ---

  test('Missing email -> 400 validation error', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const { email, ...payloadWithoutEmail } = validPayload;

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: payloadWithoutEmail,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('Short password -> 400 validation error', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: { ...validPayload, password: '123' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('Invalid branch -> 400 validation error', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: { ...validPayload, branch: 'UNKNOWN_BRANCH' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('Invalid mobile number (not 10 digits) -> 400 validation error', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: { ...validPayload, mobileNumber: '12345' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('Invalid email format -> 400 validation error', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: { ...validPayload, email: 'not-an-email' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('CGPA out of range (> 10) -> 400 validation error', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: { ...validPayload, cgpa: 11 },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('Negative backlog count -> 400 validation error', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: { ...validPayload, backlogCount: -1 },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('Empty body -> 400', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const req = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      jsonBody: {},
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
