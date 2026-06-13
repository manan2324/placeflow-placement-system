import bcrypt from "bcryptjs";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import { sendPasswordResetOtpEmail } from "@/services/email.service";
import { findUserByEmail, updatePasswordByEmail } from "@/repositories/user.repo";
import {
  createOtp,
  findLatestOtp,
  deleteOtpsByEmail,
  countRecentOtps,
  incrementAttempts,
} from "@/repositories/otp.repo";
import { badRequest, unauthorized, notFound } from "@/utils/errors";
import Otp from "@/models/Otp";

const MAX_OTP_ATTEMPTS = 5;
const MAX_OTPS_PER_HOUR = 5;
const PURPOSE = "RESET_PASSWORD";

function generateOtp() {
  return String(crypto.randomInt(1000, 10000));
}

export async function requestPasswordResetOtp(email) {
  await connectDB();

  const user = await findUserByEmail(email);
  if (!user) {
    throw notFound("No account found with this email address.", "USER_NOT_FOUND");
  }

  const recentCount = await countRecentOtps(email);
  if (recentCount >= MAX_OTPS_PER_HOUR) {
    throw badRequest(
      "Too many OTP requests. Please try again later.",
      "OTP_RATE_LIMIT"
    );
  }

  const plainOtp = generateOtp();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);

  await createOtp({
    email,
    otp: hashedOtp,
    purpose: PURPOSE,
    payload: {},
  });

  await sendPasswordResetOtpEmail(email, plainOtp);

  return { message: "OTP sent to your email address." };
}

export async function verifyPasswordResetOtp({ email, otp }) {
  await connectDB();

  const otpRecord = await findLatestOtp(email, PURPOSE);
  if (!otpRecord) {
    throw badRequest(
      "No OTP found for this email. It may have expired. Please request a new one.",
      "OTP_NOT_FOUND"
    );
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await deleteOtpsByEmail(email, PURPOSE);
    throw badRequest(
      "Too many failed attempts. Please request a new OTP.",
      "OTP_MAX_ATTEMPTS"
    );
  }

  const isValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isValid) {
    await incrementAttempts(otpRecord._id);
    const remaining = MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;
    throw unauthorized(
      `Invalid OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "Please request a new OTP."}`,
      "OTP_INVALID"
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  await Otp.findByIdAndUpdate(otpRecord._id, { resetToken });

  return { resetToken };
}

export async function resetPassword({ email, resetToken, password }) {
  await connectDB();

  const otpRecord = await findLatestOtp(email, PURPOSE);
  if (!otpRecord || otpRecord.resetToken !== resetToken) {
    throw badRequest(
      "Invalid or expired reset token. Please start over.",
      "INVALID_RESET_TOKEN"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await updatePasswordByEmail(email, passwordHash);
  if (!user) {
    throw notFound("User not found.", "USER_NOT_FOUND");
  }

  await deleteOtpsByEmail(email, PURPOSE);

  return { message: "Password reset successfully." };
}
