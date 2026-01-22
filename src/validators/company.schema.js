import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1).max(150),
  role: z.string().min(1),
  ctc: z.number().min(0),
  eligibleBranches: z.array(z.enum(["CSE", "ECE", "ME", "CE", "EE", "IT", "CHE"])).min(1),
  minCgpa: z.number().min(0).max(10),
  backlogAllowed: z.boolean().optional(),
  applicationDeadline: z.union([z.string(), z.date()]),
});
