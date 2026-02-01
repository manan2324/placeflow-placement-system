import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerStudentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  enrollmentNumber: z.string().min(1),
  branch: z.enum(["CSE", "ECE", "ME", "CE", "EE", "IT", "CHE"]),
  cgpa: z.number().min(0).max(10).optional(),
  backlogCount: z.number().min(0).max(10).optional(),
});
