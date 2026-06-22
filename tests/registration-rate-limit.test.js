const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

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

function makePayload(index) {
  return {
    name: `Student ${index}`,
    email: `student${index}@ratelimit.test`,
    password: 'password123',
    enrollmentNumber: `RL-ENR-${index}`,
    branch: 'CSE',
    cgpa: 8.0,
    backlogCount: 0,
    mobileNumber: `90000${String(index).padStart(5, '0')}`,
  };
}

describe('Registration Rate Limiting', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
    // Ensure no Upstash → ephemeral in-memory fallback
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

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

  test('registration endpoint enforces rate limit (5 req / 10 min)', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const limit = 5;
    const results = [];

    // Send limit + 1 requests from the same IP
    for (let i = 0; i < limit + 1; i++) {
      const req = makeRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'x-forwarded-for': '172.16.0.100' },
        jsonBody: makePayload(i),
      });
      results.push(await POST(req));
    }

    // First `limit` requests should NOT be 429
    for (let i = 0; i < limit; i++) {
      expect(results[i].status).not.toBe(429);
    }

    // The (limit + 1)th request should be rate-limited
    expect(results[limit].status).toBe(429);
    const body = await results[limit].json();
    expect(body.errorCode || body.code).toBe('RATE_LIMITED');
  });

  test('login endpoint enforces rate limit (10 req / 10 min)', async () => {
    const { POST } = await import('@/app/api/auth/login/route');

    const limit = 10;
    const results = [];

    for (let i = 0; i < limit + 1; i++) {
      const req = makeRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': '172.16.0.200' },
        jsonBody: { email: `user${i}@test.com`, password: 'pass' },
      });
      results.push(await POST(req));
    }

    // First `limit` requests should NOT be 429 (they may be 401 for bad credentials, that's fine)
    for (let i = 0; i < limit; i++) {
      expect(results[i].status).not.toBe(429);
    }

    // The (limit + 1)th request should be rate-limited
    expect(results[limit].status).toBe(429);
    const body = await results[limit].json();
    expect(body.errorCode || body.code).toBe('RATE_LIMITED');
  });

  test('rate limit applies per-IP: different IPs have separate limits', async () => {
    const { POST } = await import('@/app/api/auth/register/route');

    const limit = 5;

    // Exhaust limit for IP-A
    for (let i = 0; i < limit; i++) {
      const req = makeRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'x-forwarded-for': '10.10.10.1' },
        jsonBody: makePayload(100 + i),
      });
      await POST(req);
    }

    // IP-A should now be blocked
    const blockedReq = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'x-forwarded-for': '10.10.10.1' },
      jsonBody: makePayload(200),
    });
    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);

    // IP-B should still be allowed
    const allowedReq = makeRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'x-forwarded-for': '10.10.10.2' },
      jsonBody: makePayload(300),
    });
    const allowedRes = await POST(allowedReq);
    expect(allowedRes.status).not.toBe(429);
  });
});
