import { getAdminDashboard } from "@/services/adminDashboard.service";
import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";

export const GET = withErrorHandling(async (req) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const roleError = requireRole("ADMIN")(user);
    if (roleError) return roleError;

    const data = await getAdminDashboard();
    return json({ success: true, data }, { status: 200 });
});
