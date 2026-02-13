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

async function seedUsersAndProfile() {
  const { default: User } = await import('@/models/User');
  const { default: StudentProfile } = await import('@/models/StudentProfile');

  const passwordHash = await bcrypt.hash('password123', 4);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash,
    role: 'ADMIN',
    isActive: true,
  });

  const studentUser = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash,
    role: 'STUDENT',
    isActive: true,
  });

  const studentProfile = await StudentProfile.create({
    userId: studentUser._id,
    enrollmentNumber: 'ENR12345',
    branch: 'CSE',
    cgpa: 7.5,
    backlogCount: 0,
    mobileNumber: '9876543214',
  });

  return { admin, studentUser, studentProfile };
}

function generateToken(userId, role) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: userId.toString(), role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

describe('Profile Update Request Flow Tests', () => {
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

  describe('POST /api/student/profile/request - Create Profile Update Request', () => {
    test('should allow student to create profile update request', async () => {
      const { studentUser, studentProfile } = await seedUsersAndProfile();
      const token = generateToken(studentUser._id, 'STUDENT');

      const { POST } = await import('@/app/api/student/profile/request/route');

      const requestedChanges = {
        branch: 'IT',
        cgpa: 8.5,
        backlogCount: 1,
      };

      const req = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        jsonBody: { requestedChanges },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain('submitted successfully');
      expect(body.data.studentId.toString()).toBe(studentUser._id.toString());
      expect(body.data.requestedChanges.branch).toBe('IT');
      expect(body.data.requestedChanges.cgpa).toBe(8.5);
      expect(body.data.requestedChanges.backlogCount).toBe(1);
      expect(body.data.status).toBe('pending');
    });

    test('should store current values in the request', async () => {
      const { studentUser, studentProfile } = await seedUsersAndProfile();
      const token = generateToken(studentUser._id, 'STUDENT');

      const { POST } = await import('@/app/api/student/profile/request/route');

      const requestedChanges = {
        cgpa: 8.0,
      };

      const req = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        jsonBody: { requestedChanges },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.currentValues.enrollmentNumber).toBe('ENR12345');
      expect(body.data.currentValues.branch).toBe('CSE');
      expect(body.data.currentValues.cgpa).toBe(7.5);
      expect(body.data.currentValues.backlogCount).toBe(0);
    });

    test('should reject request if no changes provided', async () => {
      const { studentUser } = await seedUsersAndProfile();
      const token = generateToken(studentUser._id, 'STUDENT');

      const { POST } = await import('@/app/api/student/profile/request/route');

      const req = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        jsonBody: { requestedChanges: {} },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toContain('No changes provided');
    });

    test('should reject if student already has pending request', async () => {
      const { studentUser } = await seedUsersAndProfile();
      const token = generateToken(studentUser._id, 'STUDENT');

      const { POST } = await import('@/app/api/student/profile/request/route');

      const requestedChanges = { cgpa: 8.0 };

      // First request
      const req1 = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        jsonBody: { requestedChanges },
      });
      await POST(req1);

      // Second request (should fail)
      const req2 = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        jsonBody: { requestedChanges: { branch: 'EE' } },
      });

      const res = await POST(req2);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toContain('pending');
    });

    test('should reject unauthorized access', async () => {
      const { POST } = await import('@/app/api/student/profile/request/route');

      const req = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        jsonBody: { requestedChanges: { cgpa: 8.0 } },
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/admin/student-requests - Admin View Requests', () => {
    test('should allow admin to view all profile update requests', async () => {
      const { admin, studentUser } = await seedUsersAndProfile();
      const studentToken = generateToken(studentUser._id, 'STUDENT');
      const adminToken = generateToken(admin._id, 'ADMIN');

      // Create a profile update request as student
      const { POST: StudentPOST } = await import('@/app/api/student/profile/request/route');
      const createReq = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${studentToken}` },
        jsonBody: { requestedChanges: { cgpa: 8.5 } },
      });
      await StudentPOST(createReq);

      // Admin fetches requests
      const { GET } = await import('@/app/api/admin/student-requests/route');
      const req = makeRequest('http://localhost:3000/api/admin/student-requests', {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].studentId.name).toBe('John Doe');
      expect(body.data[0].requestedChanges.cgpa).toBe(8.5);
      expect(body.data[0].status).toBe('pending');
    });

    test('should filter requests by status', async () => {
      const { admin, studentUser } = await seedUsersAndProfile();
      const { default: ProfileUpdateRequest } = await import('@/models/ProfileUpdateRequest');
      const { default: StudentProfile } = await import('@/models/StudentProfile');

      const profile = await StudentProfile.findOne({ userId: studentUser._id });

      // Create multiple requests with different statuses
      await ProfileUpdateRequest.create({
        studentId: studentUser._id,
        studentProfileId: profile._id,
        requestedChanges: { cgpa: 8.0 },
        currentValues: { cgpa: 7.5 },
        status: 'pending',
      });

      await ProfileUpdateRequest.create({
        studentId: studentUser._id,
        studentProfileId: profile._id,
        requestedChanges: { cgpa: 9.0 },
        currentValues: { cgpa: 7.5 },
        status: 'approved',
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      });

      const adminToken = generateToken(admin._id, 'ADMIN');
      const { GET } = await import('@/app/api/admin/student-requests/route');

      // Fetch pending requests
      const req = makeRequest('http://localhost:3000/api/admin/student-requests?status=pending', {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].status).toBe('pending');
    });

    test('should reject non-admin access', async () => {
      const { studentUser } = await seedUsersAndProfile();
      const studentToken = generateToken(studentUser._id, 'STUDENT');

      const { GET } = await import('@/app/api/admin/student-requests/route');
      const req = makeRequest('http://localhost:3000/api/admin/student-requests', {
        headers: { authorization: `Bearer ${studentToken}` },
      });

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/student-requests/[id] - Approve/Reject Request', () => {
    test('should allow admin to approve profile update request', async () => {
      const { admin, studentUser, studentProfile } = await seedUsersAndProfile();
      const studentToken = generateToken(studentUser._id, 'STUDENT');
      const adminToken = generateToken(admin._id, 'ADMIN');

      // Student creates request
      const { POST: StudentPOST } = await import('@/app/api/student/profile/request/route');
      const createReq = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${studentToken}` },
        jsonBody: {
          requestedChanges: {
            branch: 'IT',
            cgpa: 8.5,
          },
        },
      });
      const createRes = await StudentPOST(createReq);
      const createBody = await createRes.json();
      const requestId = createBody.data._id;

      // Admin approves request
      const { PUT } = await import('@/app/api/admin/student-requests/[id]/route');
      const approveReq = makeRequest(`http://localhost:3000/api/admin/student-requests/${requestId}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${adminToken}` },
        jsonBody: { action: 'approve' },
      });

      const res = await PUT(approveReq, { params: { id: requestId } });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('approved');
      expect(body.data.reviewedBy.toString()).toBe(admin._id.toString());

      // Verify the profile was actually updated
      const { default: StudentProfile } = await import('@/models/StudentProfile');
      const updatedProfile = await StudentProfile.findById(studentProfile._id);
      expect(updatedProfile.branch).toBe('IT');
      expect(updatedProfile.cgpa).toBe(8.5);
    });

    test('should allow admin to reject profile update request with reason', async () => {
      const { admin, studentUser } = await seedUsersAndProfile();
      const studentToken = generateToken(studentUser._id, 'STUDENT');
      const adminToken = generateToken(admin._id, 'ADMIN');

      // Student creates request
      const { POST: StudentPOST } = await import('@/app/api/student/profile/request/route');
      const createReq = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${studentToken}` },
        jsonBody: { requestedChanges: { cgpa: 8.5 } },
      });
      const createRes = await StudentPOST(createReq);
      const createBody = await createRes.json();
      const requestId = createBody.data._id;

      // Admin rejects request
      const { PUT } = await import('@/app/api/admin/student-requests/[id]/route');
      const rejectReq = makeRequest(`http://localhost:3000/api/admin/student-requests/${requestId}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${adminToken}` },
        jsonBody: {
          action: 'reject',
          rejectionReason: 'CGPA certificate not verified',
        },
      });

      const res = await PUT(rejectReq, { params: { id: requestId } });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('rejected');
      expect(body.data.rejectionReason).toBe('CGPA certificate not verified');
    });

    test('should reject approval if request already processed', async () => {
      const { admin, studentUser } = await seedUsersAndProfile();
      const { default: ProfileUpdateRequest } = await import('@/models/ProfileUpdateRequest');
      const { default: StudentProfile } = await import('@/models/StudentProfile');

      const profile = await StudentProfile.findOne({ userId: studentUser._id });

      // Create an already approved request
      const request = await ProfileUpdateRequest.create({
        studentId: studentUser._id,
        studentProfileId: profile._id,
        requestedChanges: { cgpa: 8.0 },
        currentValues: { cgpa: 7.5 },
        status: 'approved',
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      });

      const adminToken = generateToken(admin._id, 'ADMIN');
      const { PUT } = await import('@/app/api/admin/student-requests/[id]/route');

      const req = makeRequest(`http://localhost:3000/api/admin/student-requests/${request._id}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${adminToken}` },
        jsonBody: { action: 'approve' },
      });

      const res = await PUT(req, { params: { id: request._id.toString() } });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toContain('already processed');
    });

    test('should require rejection reason when rejecting', async () => {
      const { admin, studentUser } = await seedUsersAndProfile();
      const studentToken = generateToken(studentUser._id, 'STUDENT');
      const adminToken = generateToken(admin._id, 'ADMIN');

      // Create request
      const { POST: StudentPOST } = await import('@/app/api/student/profile/request/route');
      const createReq = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${studentToken}` },
        jsonBody: { requestedChanges: { cgpa: 8.5 } },
      });
      const createRes = await StudentPOST(createReq);
      const createBody = await createRes.json();
      const requestId = createBody.data._id;

      // Reject without reason
      const { PUT } = await import('@/app/api/admin/student-requests/[id]/route');
      const rejectReq = makeRequest(`http://localhost:3000/api/admin/student-requests/${requestId}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${adminToken}` },
        jsonBody: { action: 'reject' },
      });

      const res = await PUT(rejectReq, { params: { id: requestId } });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Rejection reason is required');
    });

    test('should reject invalid action', async () => {
      const { admin, studentUser } = await seedUsersAndProfile();
      const studentToken = generateToken(studentUser._id, 'STUDENT');
      const adminToken = generateToken(admin._id, 'ADMIN');

      // Create request
      const { POST: StudentPOST } = await import('@/app/api/student/profile/request/route');
      const createReq = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${studentToken}` },
        jsonBody: { requestedChanges: { cgpa: 8.5 } },
      });
      const createRes = await StudentPOST(createReq);
      const createBody = await createRes.json();
      const requestId = createBody.data._id;

      // Invalid action
      const { PUT } = await import('@/app/api/admin/student-requests/[id]/route');
      const req = makeRequest(`http://localhost:3000/api/admin/student-requests/${requestId}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${adminToken}` },
        jsonBody: { action: 'invalid' },
      });

      const res = await PUT(req, { params: { id: requestId } });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Invalid action');
    });

    test('should reject non-admin access', async () => {
      const { studentUser } = await seedUsersAndProfile();
      const studentToken = generateToken(studentUser._id, 'STUDENT');

      const { PUT } = await import('@/app/api/admin/student-requests/[id]/route');
      const req = makeRequest('http://localhost:3000/api/admin/student-requests/123', {
        method: 'PUT',
        headers: { authorization: `Bearer ${studentToken}` },
        jsonBody: { action: 'approve' },
      });

      const res = await PUT(req, { params: { id: '123' } });
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/student/profile/request - Student View Own Requests', () => {
    test('should allow student to view their own requests', async () => {
      const { studentUser } = await seedUsersAndProfile();
      const token = generateToken(studentUser._id, 'STUDENT');

      // Create request
      const { POST } = await import('@/app/api/student/profile/request/route');
      const createReq = makeRequest('http://localhost:3000/api/student/profile/request', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        jsonBody: { requestedChanges: { cgpa: 8.5 } },
      });
      await POST(createReq);

      // Fetch own requests
      const { GET } = await import('@/app/api/student/profile/request/route');
      const req = makeRequest('http://localhost:3000/api/student/profile/request', {
        headers: { authorization: `Bearer ${token}` },
      });

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].requestedChanges.cgpa).toBe(8.5);
    });
  });
});

