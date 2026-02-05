import ProfileUpdateRequest from '@/models/ProfileUpdateRequest';
import StudentProfile from '@/models/StudentProfile';

class ProfileUpdateRequestRepository {
  async createRequest(studentId, studentProfileId, requestedChanges, currentValues) {
    const request = await ProfileUpdateRequest.create({
      studentId,
      studentProfileId,
      requestedChanges,
      currentValues,
      status: 'pending'
    });
    return request;
  }

  async findById(requestId) {
    return ProfileUpdateRequest.findById(requestId)
      .populate('studentId', 'name email')
      .populate('studentProfileId')
      .populate('reviewedBy', 'name email');
  }

  async findAllPending() {
    return ProfileUpdateRequest.find({ status: 'pending' })
      .populate('studentId', 'name email')
      .populate('studentProfileId')
      .sort({ createdAt: -1 });
  }

  async findAllByStatus(status) {
    return ProfileUpdateRequest.find({ status })
      .populate('studentId', 'name email')
      .populate('studentProfileId')
      .sort({ createdAt: -1 });
  }

  async findAll() {
    return ProfileUpdateRequest.find()
      .populate('studentId', 'name email')
      .populate('studentProfileId')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByStudentId(studentId) {
    return ProfileUpdateRequest.find({ studentId })
      .sort({ createdAt: -1 });
  }

  async hasPendingRequest(studentId) {
    const count = await ProfileUpdateRequest.countDocuments({
      studentId,
      status: 'pending'
    });
    return count > 0;
  }

  async approveRequest(requestId, adminId) {
    const request = await ProfileUpdateRequest.findById(requestId);
    if (!request) throw new Error('Request not found');
    if (request.status !== 'pending') throw new Error('Request already processed');

    // Update the student profile
    await StudentProfile.findByIdAndUpdate(
      request.studentProfileId,
      { $set: request.requestedChanges }
    );

    // Update request status
    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    return request;
  }

  async rejectRequest(requestId, adminId, rejectionReason) {
    const request = await ProfileUpdateRequest.findById(requestId);
    if (!request) throw new Error('Request not found');
    if (request.status !== 'pending') throw new Error('Request already processed');

    request.status = 'rejected';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();

    return request;
  }
}

export default new ProfileUpdateRequestRepository();
