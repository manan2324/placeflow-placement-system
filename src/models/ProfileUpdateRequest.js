import mongoose from 'mongoose';

const profileUpdateRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  requestedChanges: {
    enrollmentNumber: String,
    branch: String,
    cgpa: Number,
    backlogCount: Number,
    mobileNumber: String
  },
  currentValues: {
    enrollmentNumber: String,
    branch: String,
    cgpa: Number,
    backlogCount: Number,
    mobileNumber: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Index for faster queries
profileUpdateRequestSchema.index({ studentId: 1, status: 1 });
profileUpdateRequestSchema.index({ status: 1, createdAt: -1 });

const ProfileUpdateRequest = mongoose.models.ProfileUpdateRequest || 
  mongoose.model('ProfileUpdateRequest', profileUpdateRequestSchema);

export default ProfileUpdateRequest;
