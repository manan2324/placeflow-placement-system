import connectDB from "@/lib/mongodb";
import StudentProfile from "@/models/StudentProfile";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/lib/auth";
import { withCache, CACHE_KEYS } from "@/lib/cache";

export const GET = withErrorHandling(async (req) => {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const forbidden = requireRole("ADMIN")(user);
  if (forbidden) return forbidden;

  const data = await withCache(CACHE_KEYS.ADMIN_STUDENTS, 180, async () => {
    await connectDB();

    // Basic listing of all students with populated user fields
    const students = await StudentProfile.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Normalize shape for client consumption
    return students.map((s) => ({
      _id: s._id,
      enrollmentNumber: s.enrollmentNumber,
      mobileNumber: s.mobileNumber,
      branch: s.branch,
      cgpa: s.cgpa,
      hasBacklog: !!s.hasBacklog,
      resumeUrl: s.resumeUrl || null,
      resumeUpdatedAt: s.resumeUpdatedAt || null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      user: s.userId ? { name: s.userId.name, email: s.userId.email } : null,
    }));
  });

  return json(data);
});
