import profileUpdateRequestRepo from '@/repositories/profileUpdateRequest.repo';
import { findStudentProfileByUserId } from '@/repositories/student.repo';

class ProfileUpdateRequestService {
  async createProfileUpdateRequest(userId, requestedChanges) {
    // Get current student profile
    const profile = await findStudentProfileByUserId(userId);
    if (!profile) {
      throw new Error('Student profile not found');
    }

    // Check if there's already a pending request
    const hasPending = await profileUpdateRequestRepo.hasPendingRequest(userId);
    if (hasPending) {
      throw new Error('You already have a pending profile update request');
    }

    // Store current values
    const currentValues = {
      enrollmentNumber: profile.enrollmentNumber,
      branch: profile.branch,
      cgpa: profile.cgpa,
      backlogCount: profile.backlogCount,
      mobileNumber: profile.mobileNumber
    };

    // Create the request
    const request = await profileUpdateRequestRepo.createRequest(
      userId,
      profile._id,
      requestedChanges,
      currentValues
    );

    return request;
  }

  async getAllRequests() {
    return profileUpdateRequestRepo.findAll();
  }

  async getPendingRequests() {
    return profileUpdateRequestRepo.findAllPending();
  }

  async getRequestsByStatus(status) {
    return profileUpdateRequestRepo.findAllByStatus(status);
  }

  async getRequestById(requestId) {
    return profileUpdateRequestRepo.findById(requestId);
  }

  async approveRequest(requestId, adminId) {
    return profileUpdateRequestRepo.approveRequest(requestId, adminId);
  }

  async rejectRequest(requestId, adminId, rejectionReason) {
    return profileUpdateRequestRepo.rejectRequest(requestId, adminId, rejectionReason);
  }

  async getStudentRequests(studentId) {
    return profileUpdateRequestRepo.findByStudentId(studentId);
  }
}

export default new ProfileUpdateRequestService();
