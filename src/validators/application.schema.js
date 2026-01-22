import { z } from "zod";

export const listCompanyApplicationsQuerySchema = z.object({
  companyId: z.string().min(1).optional(),
  status: z.enum(["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"]).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"]),
  remark: z.string().max(500).optional(),
});
