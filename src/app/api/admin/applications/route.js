import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { validate } from "@/utils/validate";
import { listCompanyApplicationsQuerySchema } from "@/validators/application.schema";
import { listCompanyApplications } from "@/services/application.service";

export const GET = withErrorHandling(async (req) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const roleError = requireRole("ADMIN")(user);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const query = {
        companyId: searchParams.get("companyId") ?? undefined,
        status: searchParams.get("status") ?? undefined,
    };

    const { companyId, status } = validate(listCompanyApplicationsQuerySchema, query);

    const applications = await listCompanyApplications({ companyId, status });
    return json(applications, { status: 200 });
});