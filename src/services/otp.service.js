import bcrypt from "bcryptjs";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import { sendOtpEmail } from "@/services/email.service";
import { findUserByEmail, createUser } from "@/repositories/user.repo";
import {
  findStudentByEnrollmentNumber,
  findStudentByMobileNumber,
  createStudentProfile,
} from "@/repositories/student.repo";
import {
  createOtp,
  findLatestOtp,
  deleteOtpsByEmail,
  countRecentOtps,
  incrementAttempts,
} from "@/repositories/otp.repo";
import { badRequest, conflict, unauthorized } from "@/utils/errors";
import mongoose from "mongoose";

const MAX_OTP_ATTEMPTS = 5;
const MAX_OTPS_PER_HOUR = 5;

function generateOtp() {
  // secure and avoids modulo bias
  return String(crypto.randomInt(1000, 10000));
}

export async function requestRegistrationOtp(payload) {
  await connectDB();

  const emailExists = await findUserByEmail(payload.email);
  if (emailExists) throw conflict("Email is already registered.", "EMAIL_EXISTS");

  const enrollmentExists = await findStudentByEnrollmentNumber(payload.enrollmentNumber);
  if (enrollmentExists)
    throw conflict("This Enrollment Number is already registered.", "ENROLLMENT_EXISTS");

  const mobileExists = await findStudentByMobileNumber(payload.mobileNumber);
  if (mobileExists)
    throw conflict("This Mobile Number is already registered.", "MOBILE_EXISTS");

  if (!payload.password) throw badRequest("Missing required fields", "MISSING_FIELDS");

  // Rate limit
  const recentCount = await countRecentOtps(payload.email);
  if (recentCount >= MAX_OTPS_PER_HOUR) {
    throw badRequest(
      "Too many OTP requests. Please try again later.",
      "OTP_RATE_LIMIT"
    );
  }

  const plainOtp = generateOtp();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);

  const passwordHash = await bcrypt.hash(payload.password, 12);

  await createOtp({
    email: payload.email,
    otp: hashedOtp,
    purpose: "REGISTRATION",
    payload: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      enrollmentNumber: payload.enrollmentNumber,
      branch: payload.branch,
      cgpa: payload.cgpa,
      backlogCount: payload.backlogCount,
      mobileNumber: payload.mobileNumber,
    },
  });

  await sendOtpEmail(payload.email, plainOtp);

  return { message: "OTP sent to your email address." };
}

export async function verifyRegistrationOtp({ email, otp }) {
  await connectDB();

  const otpRecord = await findLatestOtp(email, "REGISTRATION");
  if (!otpRecord) {
    throw badRequest(
      "No OTP found for this email. It may have expired. Please request a new one.",
      "OTP_NOT_FOUND"
    );
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await deleteOtpsByEmail(email);
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

  const storedPayload = otpRecord.payload;
  let user = null;

  try {
    user = await createUser({
      name: storedPayload.name,
      email: storedPayload.email,
      passwordHash: storedPayload.passwordHash,
      role: "STUDENT",
    });

    await createStudentProfile({
      userId: user._id,
      enrollmentNumber: storedPayload.enrollmentNumber,
      branch: storedPayload.branch,
      cgpa: storedPayload.cgpa,
      backlogCount: storedPayload.backlogCount,
      mobileNumber: storedPayload.mobileNumber,
    });
  } catch (error) {
    if (user && user._id) {
      const User = mongoose.model("User");
      await User.findByIdAndDelete(user._id).catch(() => {});
    }
    throw error;
  }

  await deleteOtpsByEmail(email);

  return {
    pendingApproval: true,
    name: user.name,
  };
}
