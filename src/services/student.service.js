import connectDB from "@/lib/mongodb";
import { notFound, badRequest, forbidden } from "@/utils/errors";
import { findStudentProfileByUserId, updateStudentResumeByUserId } from "@/repositories/student.repo";

const FORBIDDEN_FIELDS = ["cgpa", "branch", "backlogCount", "enrollmentNumber"];

export async function getStudentProfile(userId) {
  await connectDB();

  const profile = await findStudentProfileByUserId(userId, { populateUser: true });
  if (!profile) throw notFound("Student profile not found", "PROFILE_NOT_FOUND");

  return profile;
}

export async function updateStudentResume(userId, body) {
  await connectDB();

  if (!body || !body.resumeUrl) {
    throw badRequest("Only resumeUrl can be updated", "INVALID_UPDATE");
  }

  for (const field of FORBIDDEN_FIELDS) {
    if (field in body) {
      throw forbidden(`${field} cannot be updated`, "IMMUTABLE_FIELD");
    }
  }

  const allowedKeys = new Set(["resumeUrl"]);
  for (const key of Object.keys(body)) {
    if (!allowedKeys.has(key)) {
      throw badRequest("Only resumeUrl can be updated", "INVALID_UPDATE");
    }
  }

  if (typeof body.resumeUrl !== "string") {
    throw badRequest("resumeUrl is invalid", "INVALID_RESUME_URL");
  }

  // Store URL or Cloudinary public_id
  const url = body.resumeUrl.trim();
  
  // Allow local paths OR Cloudinary public IDs
  const isLocalPath = url.startsWith("/uploads/resumes/") && url.toLowerCase().endsWith(".pdf");
  const isCloudinaryId = url.startsWith("resumes/") && !url.includes("..");
  
  if (!isLocalPath && !isCloudinaryId) {
    throw badRequest("resumeUrl must be a valid local path or Cloudinary ID", "INVALID_RESUME_URL");
  }

  const updated = await updateStudentResumeByUserId(
    userId,
    { resumeUrl: url, resumeUpdatedAt: new Date() }
  );

  if (!updated) throw notFound("Student profile not found", "PROFILE_NOT_FOUND");

  return updated;
}
