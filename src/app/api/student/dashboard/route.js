import { getStudentDashboard } from "@/services/dashboard.service";
import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";

export const GET = withErrorHandling(async (req) => {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const { user } = authResult;
  const roleError = requireRole("STUDENT")(user);
  if (roleError) return roleError;

  const data = await getStudentDashboard(user._id);
  return json({ success: true, data }, { status: 200 });
});