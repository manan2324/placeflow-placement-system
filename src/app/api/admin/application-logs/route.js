import connectDB from "@/lib/mongodb";
import ApplicationLog from "@/models/ApplicationLog";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/lib/auth";

export const GET = withErrorHandling(async (req) => {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const forbidden = requireRole("ADMIN")(user);
  if (forbidden) return forbidden;

  await connectDB();

  // Fetch all application logs with populated references
  const logs = await ApplicationLog.find()
    .populate({
      path: "applicationId",
      populate: [
        {
          path: "studentId",
          populate: { path: "userId", select: "name email" }
        },
        {
          path: "companyId",
          select: "name role"
        }
      ]
    })
    .populate("changedBy", "name email role")
    .sort({ changedAt: -1 })
    .lean();

  // Normalize data for client
  const data = logs.map((log) => ({
    _id: log._id,
    oldStatus: log.oldStatus,
    newStatus: log.newStatus,
    changedAt: log.changedAt,
    remark: log.remark || null,
    changedBy: log.changedBy ? {
      _id: log.changedBy._id,
      name: log.changedBy.name,
      email: log.changedBy.email,
      role: log.changedBy.role
    } : null,
    application: log.applicationId ? {
      _id: log.applicationId._id,
      status: log.applicationId.status,
      student: log.applicationId.studentId ? {
        enrollmentNumber: log.applicationId.studentId.enrollmentNumber,
        branch: log.applicationId.studentId.branch,
        user: log.applicationId.studentId.userId ? {
          name: log.applicationId.studentId.userId.name,
          email: log.applicationId.studentId.userId.email
        } : null
      } : null,
      company: log.applicationId.companyId ? {
        _id: log.applicationId.companyId._id,
        name: log.applicationId.companyId.name,
        role: log.applicationId.companyId.role
      } : null
    } : null
  }));

  return json(data);
});
