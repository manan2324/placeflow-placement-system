const mongoose = require('mongoose');

const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

describe('Registration Transaction Atomicity', () => {
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

  test('successful registration creates both User and StudentProfile atomically', async () => {
    const { registerStudent } = await import('@/services/auth.service');
    const { default: User } = await import('@/models/User');
    const { default: StudentProfile } = await import('@/models/StudentProfile');

    const payload = {
      name: 'Transaction Student',
      email: 'txn.student@example.com',
      password: 'password123',
      enrollmentNumber: 'TXN-001',
      branch: 'CSE',
      cgpa: 8.0,
      backlogCount: 0,
      mobileNumber: '9000000001',
    };

    const result = await registerStudent(payload);
    expect(result.userId).toBeTruthy();

    const user = await User.findById(result.userId);
    expect(user).toBeTruthy();
    expect(user.email).toBe(payload.email);

    const profile = await StudentProfile.findOne({ userId: result.userId });
    expect(profile).toBeTruthy();
    expect(profile.enrollmentNumber).toBe(payload.enrollmentNumber);
  });

  test('transaction rolls back User when StudentProfile creation fails (no orphaned User)', async () => {
    const { registerStudent } = await import('@/services/auth.service');
    const { default: User } = await import('@/models/User');
    const { default: StudentProfile } = await import('@/models/StudentProfile');

    // First, create a profile with the same enrollmentNumber to force a conflict
    // when the transaction tries to create the StudentProfile.
    const existingUser = await User.create({
      name: 'Existing',
      email: 'existing@example.com',
      passwordHash: '$2a$04$' + 'a'.repeat(53), // fake bcrypt hash
      role: 'STUDENT',
      isActive: true,
    });

    await StudentProfile.create({
      userId: existingUser._id,
      enrollmentNumber: 'CONFLICT-ENR',
      branch: 'ECE',
      mobileNumber: '9000000099',
    });

    const payload = {
      name: 'New Student',
      email: 'new.student@example.com',
      password: 'password123',
      enrollmentNumber: 'CONFLICT-ENR', // will cause duplicate error during transaction
      branch: 'CSE',
      cgpa: 7.0,
      backlogCount: 0,
      mobileNumber: '9000000002',
    };

    await expect(registerStudent(payload)).rejects.toThrow();

    // The critical assertion: no orphaned User should exist for the new email
    const orphanedUser = await User.findOne({ email: 'new.student@example.com' });
    expect(orphanedUser).toBeNull();

    // Original records should be untouched
    const originalUser = await User.findById(existingUser._id);
    expect(originalUser).toBeTruthy();
  });

  test('transaction rolls back User when StudentProfile mobile number conflicts', async () => {
    const { registerStudent } = await import('@/services/auth.service');
    const { default: User } = await import('@/models/User');
    const { default: StudentProfile } = await import('@/models/StudentProfile');

    // Seed a profile with a specific mobile number
    const existingUser = await User.create({
      name: 'Mobile Owner',
      email: 'mobile.owner@example.com',
      passwordHash: '$2a$04$' + 'a'.repeat(53),
      role: 'STUDENT',
      isActive: true,
    });

    await StudentProfile.create({
      userId: existingUser._id,
      enrollmentNumber: 'MOB-001',
      branch: 'ME',
      mobileNumber: '8888888888',
    });

    const payload = {
      name: 'Duplicate Mobile',
      email: 'dup.mobile@example.com',
      password: 'password123',
      enrollmentNumber: 'MOB-002',
      branch: 'CSE',
      cgpa: 6.0,
      backlogCount: 1,
      mobileNumber: '8888888888', // conflict!
    };

    await expect(registerStudent(payload)).rejects.toThrow();

    // No orphaned User
    const orphanedUser = await User.findOne({ email: 'dup.mobile@example.com' });
    expect(orphanedUser).toBeNull();
  });

  test('conflict checks run before the transaction starts (email)', async () => {
    const { registerStudent } = await import('@/services/auth.service');
    const { default: User } = await import('@/models/User');

    const payload = {
      name: 'First Student',
      email: 'first@example.com',
      password: 'password123',
      enrollmentNumber: 'FIRST-001',
      branch: 'CSE',
      cgpa: 9.0,
      backlogCount: 0,
      mobileNumber: '7000000001',
    };

    await registerStudent(payload);

    // Try registering with the same email
    const payload2 = {
      ...payload,
      enrollmentNumber: 'FIRST-002',
      mobileNumber: '7000000002',
    };

    try {
      await registerStudent(payload2);
      fail('Should have thrown');
    } catch (err) {
      expect(err.status).toBe(409);
      expect(err.code).toBe('EMAIL_EXISTS');
    }
  });

  test('conflict checks run before the transaction starts (enrollment)', async () => {
    const { registerStudent } = await import('@/services/auth.service');

    const payload = {
      name: 'Enroll Student',
      email: 'enroll1@example.com',
      password: 'password123',
      enrollmentNumber: 'DUP-ENR',
      branch: 'IT',
      cgpa: 7.5,
      backlogCount: 0,
      mobileNumber: '7000000003',
    };

    await registerStudent(payload);

    const payload2 = {
      ...payload,
      email: 'enroll2@example.com',
      mobileNumber: '7000000004',
    };

    try {
      await registerStudent(payload2);
      fail('Should have thrown');
    } catch (err) {
      expect(err.status).toBe(409);
      expect(err.code).toBe('ENROLLMENT_EXISTS');
    }
  });

  test('conflict checks run before the transaction starts (mobile)', async () => {
    const { registerStudent } = await import('@/services/auth.service');

    const payload = {
      name: 'Mobile Student',
      email: 'mobile1@example.com',
      password: 'password123',
      enrollmentNumber: 'MOB-ENR-1',
      branch: 'EE',
      cgpa: 6.5,
      backlogCount: 2,
      mobileNumber: '6000000001',
    };

    await registerStudent(payload);

    const payload2 = {
      ...payload,
      email: 'mobile2@example.com',
      enrollmentNumber: 'MOB-ENR-2',
    };

    try {
      await registerStudent(payload2);
      fail('Should have thrown');
    } catch (err) {
      expect(err.status).toBe(409);
      expect(err.code).toBe('MOBILE_EXISTS');
    }
  });

  test('password is hashed, not stored in plain text', async () => {
    const { registerStudent } = await import('@/services/auth.service');
    const { default: User } = await import('@/models/User');

    const plainPassword = 'myPlainPassword!';

    const payload = {
      name: 'Hash Test',
      email: 'hash.test@example.com',
      password: plainPassword,
      enrollmentNumber: 'HASH-001',
      branch: 'CSE',
      cgpa: 8.0,
      backlogCount: 0,
      mobileNumber: '5000000001',
    };

    const { userId } = await registerStudent(payload);

    const user = await User.findById(userId);
    expect(user.passwordHash).toBeTruthy();
    expect(user.passwordHash).not.toBe(plainPassword);
    expect(user.passwordHash.startsWith('$2')).toBe(true); // bcrypt hash prefix
  });
});
