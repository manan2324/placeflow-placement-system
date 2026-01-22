import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { listStudentApplications } from "@/services/application.service";

export const GET = withErrorHandling(async (req) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    const roleError = requireRole("STUDENT")(user);
    if (roleError) return roleError;

    const response = await listStudentApplications({ userId: user._id });
    return json(response, { status: 200 });
});