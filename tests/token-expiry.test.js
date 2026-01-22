const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { startInMemoryMongo, stopInMemoryMongo, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

function makeRequest(url, { method = 'GET', headers = {} } = {}) {
  return new Request(url, { method, headers });
}

describe('Token Expiry Test', () => {
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

  test('Expired token must return 401 (not 500)', async () => {
    const { GET } = await import('@/app/api/student/dashboard/route');

    const userId = new mongoose.Types.ObjectId().toString();
    const expiredToken = jwt.sign(
      {
        userId,
        role: 'STUDENT',
        // set expiration in the past
        exp: Math.floor(Date.now() / 1000) - 10,
      },
      process.env.JWT_SECRET
    );

    const req = makeRequest('http://localhost/api/student/dashboard', {
      method: 'GET',
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.code || body.errorCode).toBe('INVALID_TOKEN');
  });
});
