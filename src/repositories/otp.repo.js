import Otp from "@/models/Otp";

export async function createOtp({ email, otp, purpose, payload }) {
  return Otp.create({ email, otp, purpose, payload });
}

export async function findLatestOtp(email, purpose = "REGISTRATION") {
  return Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
}

export async function deleteOtpsByEmail(email, purpose = "REGISTRATION") {
  return Otp.deleteMany({ email, purpose });
}

export async function countRecentOtps(email, windowMs = 60 * 60 * 1000) {
  const since = new Date(Date.now() - windowMs);
  return Otp.countDocuments({ email, createdAt: { $gte: since } });
}

export async function incrementAttempts(otpId) {
  return Otp.findByIdAndUpdate(otpId, { $inc: { attempts: 1 } }, { new: true });
}
