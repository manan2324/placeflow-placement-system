import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { closeCompanyAsAdmin } from "@/services/company.service";

export const PATCH = withErrorHandling(async (req, { params }) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const roleError = requireRole("ADMIN")(user);
    if (roleError) return roleError;

    const { id } = await params;
    const result = await closeCompanyAsAdmin(id);
    return json(result, { status: 200 });
});