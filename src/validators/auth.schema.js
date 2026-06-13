import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const registerStudentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(6),
  enrollmentNumber: z.string().min(1),
  branch: z.enum(["CSE", "ECE", "ME", "CE", "EE", "IT", "CHE"]),
  cgpa: z.number().min(0).max(10).optional(),
  backlogCount: z.number().min(0).max(10).optional(),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export const forgotPasswordSendOtpSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  resetToken: z.string().min(1),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
