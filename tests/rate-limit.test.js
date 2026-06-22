jest.setTimeout(30000);

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

function makeRequest(url, { method = 'GET', headers = {} } = {}) {
  return new Request(url, {
    method,
    headers,
  });
}

describe('Rate Limiter (Upstash-based)', () => {
  beforeEach(() => {
    // Clear the module registry so each test gets fresh limiter instances
    jest.resetModules();

    // Ensure no Upstash env vars → uses ephemeral in-memory fallback
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  test('allows requests under the limit', async () => {
    const { rateLimit } = await import('@/utils/rateLimit');

    const req = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });

    const result = await rateLimit(req, { keyPrefix: 'test:under', limit: 5, windowMs: 60_000 });
    expect(result).toBeNull();
  });

  test('blocks requests that exceed the limit with 429', async () => {
    const { rateLimit } = await import('@/utils/rateLimit');

    const limit = 3;
    const results = [];

    for (let i = 0; i < limit + 2; i++) {
      const req = makeRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '10.0.0.2' },
      });
      results.push(await rateLimit(req, { keyPrefix: 'test:exceed', limit, windowMs: 60_000 }));
    }

    // First `limit` requests should pass
    for (let i = 0; i < limit; i++) {
      expect(results[i]).toBeNull();
    }

    // Requests after the limit should be blocked
    for (let i = limit; i < results.length; i++) {
      expect(results[i]).not.toBeNull();
      expect(results[i].status).toBe(429);

      const body = await results[i].json();
      expect(body.errorCode || body.code).toBe('RATE_LIMITED');
    }
  });

  test('tracks different IPs independently', async () => {
    const { rateLimit } = await import('@/utils/rateLimit');

    const limit = 1;

    // Exhaust limit for IP-A
    const reqA = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });
    const r1 = await rateLimit(reqA, { keyPrefix: 'test:multi-ip', limit, windowMs: 60_000 });
    expect(r1).toBeNull();

    // IP-A is now blocked
    const reqA2 = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });
    const r2 = await rateLimit(reqA2, { keyPrefix: 'test:multi-ip', limit, windowMs: 60_000 });
    expect(r2).not.toBeNull();
    expect(r2.status).toBe(429);

    // IP-B should still be allowed
    const reqB = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.2' },
    });
    const r3 = await rateLimit(reqB, { keyPrefix: 'test:multi-ip', limit, windowMs: 60_000 });
    expect(r3).toBeNull();
  });

  test('extracts IP from x-forwarded-for header', async () => {
    const { rateLimit } = await import('@/utils/rateLimit');

    const req = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });

    // Should use the first IP (1.2.3.4)
    const result = await rateLimit(req, { keyPrefix: 'test:xff', limit: 1, windowMs: 60_000 });
    expect(result).toBeNull();

    // Same first IP → should now be blocked
    const req2 = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '1.2.3.4, 9.9.9.9' },
    });
    const result2 = await rateLimit(req2, { keyPrefix: 'test:xff', limit: 1, windowMs: 60_000 });
    expect(result2).not.toBeNull();
    expect(result2.status).toBe(429);
  });

  test('extracts IP from x-real-ip when x-forwarded-for is absent', async () => {
    const { rateLimit } = await import('@/utils/rateLimit');

    const req = makeRequest('http://localhost/api/test', {
      headers: { 'x-real-ip': '99.99.99.99' },
    });

    const result = await rateLimit(req, { keyPrefix: 'test:realip', limit: 1, windowMs: 60_000 });
    expect(result).toBeNull();

    const req2 = makeRequest('http://localhost/api/test', {
      headers: { 'x-real-ip': '99.99.99.99' },
    });
    const result2 = await rateLimit(req2, { keyPrefix: 'test:realip', limit: 1, windowMs: 60_000 });
    expect(result2).not.toBeNull();
  });

  test('falls back to "unknown" IP when no IP headers are present', async () => {
    const { rateLimit } = await import('@/utils/rateLimit');

    const req = makeRequest('http://localhost/api/test');
    const result = await rateLimit(req, { keyPrefix: 'test:noip', limit: 1, windowMs: 60_000 });
    expect(result).toBeNull();

    const req2 = makeRequest('http://localhost/api/test');
    const result2 = await rateLimit(req2, { keyPrefix: 'test:noip', limit: 1, windowMs: 60_000 });
    expect(result2).not.toBeNull();
    expect(result2.status).toBe(429);
  });

  test('different keyPrefixes have separate limits', async () => {
    const { rateLimit } = await import('@/utils/rateLimit');

    const ip = '50.50.50.50';

    // Exhaust limit on prefix-A
    const reqA = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip },
    });
    await rateLimit(reqA, { keyPrefix: 'prefix-a', limit: 1, windowMs: 60_000 });

    const reqA2 = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip },
    });
    const blockedA = await rateLimit(reqA2, { keyPrefix: 'prefix-a', limit: 1, windowMs: 60_000 });
    expect(blockedA).not.toBeNull();

    // prefix-B should still have its own quota
    const reqB = makeRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip },
    });
    const allowedB = await rateLimit(reqB, { keyPrefix: 'prefix-b', limit: 1, windowMs: 60_000 });
    expect(allowedB).toBeNull();
  });
});
