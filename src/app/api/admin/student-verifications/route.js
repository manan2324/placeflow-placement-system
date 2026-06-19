import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/lib/auth";

export const GET = withErrorHandling(async (req) => {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const forbidden = requireRole("ADMIN")(user);
  if (forbidden) return forbidden;

  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let userFilter = { role: "STUDENT" };

  if (status === "pending") {
    userFilter.isApproved = false;
  } else if (status === "approved") {
    userFilter.isApproved = true;
  }

  const students = await User.find(userFilter)
    .select("name email isApproved approvedAt isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const userIds = students.map((s) => s._id);
  const profiles = await StudentProfile.find({ userId: { $in: userIds } })
    .lean();

  const profileMap = {};
  profiles.forEach((p) => {
    profileMap[p.userId.toString()] = p;
  });

  const data = students.map((s) => {
    const profile = profileMap[s._id.toString()];
    return {
      _id: s._id,
      name: s.name,
      email: s.email,
      isApproved: s.isApproved,
      approvedAt: s.approvedAt || null,
      registeredAt: s.createdAt,
      enrollmentNumber: profile?.enrollmentNumber || null,
      branch: profile?.branch || null,
      cgpa: profile?.cgpa ?? null,
      backlogCount: profile?.backlogCount ?? 0,
      mobileNumber: profile?.mobileNumber || null,
      resumeUrl: profile?.resumeUrl || null,
    };
  });

  return json({ data });
});
