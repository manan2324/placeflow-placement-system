import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import { generateToken } from "@/lib/jwt";

import { findUserByEmail, createUser } from "@/repositories/user.repo";
import { findStudentByEnrollmentNumber, createStudentProfile } from "@/repositories/student.repo";
import { badRequest, conflict, forbidden, unauthorized } from "@/utils/errors";

export async function login({ email, password }) {
  await connectDB();

  const user = await findUserByEmail(email);
  if (!user) throw unauthorized("Invalid email or password", "INVALID_CREDENTIALS");

  if (!user.isActive) throw forbidden("Account is inactive", "ACCOUNT_INACTIVE");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw unauthorized("Invalid email or password", "INVALID_CREDENTIALS");

  const token = generateToken(user);

  return { token, role: user.role };
}

export async function registerStudent(payload) {
  await connectDB();

  const emailExists = await findUserByEmail(payload.email);
  if (emailExists) throw conflict("Email is already registered.", "EMAIL_EXISTS");

  const enrollmentExists = await findStudentByEnrollmentNumber(payload.enrollmentNumber);
  if (enrollmentExists) throw conflict("This Enrollment Number is already registered.", "ENROLLMENT_EXISTS");

  if (!payload.password) throw badRequest("Missing required fields", "MISSING_FIELDS");

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const user = await createUser({
    name: payload.name,
    email: payload.email,
    passwordHash,
    role: "STUDENT",
  });

  await createStudentProfile({
    userId: user._id,
    enrollmentNumber: payload.enrollmentNumber,
    branch: payload.branch,
    cgpa: payload.cgpa,
    backlogCount: payload.backlogCount,
  });

  return { userId: user._id };
}
