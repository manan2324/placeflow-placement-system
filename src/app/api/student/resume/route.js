import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import { requireAuth, requireRole } from "@/lib/auth";
import { errorResponse, json, withErrorHandling } from "@/utils/apiResponse";
import { rateLimit } from "@/utils/rateLimit";
import { updateStudentResume } from "@/services/student.service";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 2 * 1024 * 1024; // 2MB

function isPdfMagic(buffer) {
  // PDF files start with "%PDF-"
  if (!buffer || buffer.length < 5) return false;
  return buffer.slice(0, 5).toString("utf8") === "%PDF-";
}

export const POST = withErrorHandling(async (req) => {
  const rl = rateLimit(req, { keyPrefix: "student:resume-upload", limit: 10, windowMs: 10 * 60 * 1000 });
  if (rl) return rl;

  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const { user } = authResult;
  const roleError = requireRole("STUDENT")(user);
  if (roleError) return roleError;

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return errorResponse("Content-Type must be multipart/form-data", {
      status: 400,
      errorCode: "INVALID_CONTENT_TYPE",
    });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!file) {
    return errorResponse("Resume file is required", { status: 400, errorCode: "MISSING_FILE" });
  }

  if (typeof file === "string") {
    return errorResponse("Invalid file", { status: 400, errorCode: "INVALID_FILE" });
  }

  if (file.type !== "application/pdf") {
    return errorResponse("Only PDF files are allowed", { status: 400, errorCode: "INVALID_FILE_TYPE" });
  }

  if (file.size > MAX_PDF_BYTES) {
    return errorResponse("File too large", { status: 400, errorCode: "FILE_TOO_LARGE" });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isPdfMagic(buffer)) {
    return errorResponse("Only PDF files are allowed", { status: 400, errorCode: "INVALID_FILE_CONTENT" });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}.pdf`;
  const fullPath = path.join(uploadsDir, fileName);

  // Do not trust client-provided filename and always generate server-side
  await fs.writeFile(fullPath, buffer);

  // Store URL (public path), not local file system path.
  const url = `/uploads/resumes/${fileName}`;

  // Update student profile with resume URL
  await updateStudentResume(user._id, { resumeUrl: url });

  return json({ success: true, url }, { status: 201 });
});
