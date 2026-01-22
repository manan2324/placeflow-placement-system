import { z } from "zod";

export const updateResumeSchema = z.object({
  resumeUrl: z.string().min(1),
}).passthrough();
