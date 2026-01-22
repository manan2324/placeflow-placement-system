import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { createCompanyAsAdmin, listCompaniesForRequest } from "@/services/company.service";

export const GET = withErrorHandling(async (req) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const roleError = requireRole("ADMIN")(user);
    if (roleError) return roleError;

    const companies = await listCompaniesForRequest(req);
    return json(companies, { status: 200 });
});

export const POST = withErrorHandling(async (req) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const roleError = requireRole("ADMIN")(user);
    if (roleError) return roleError;

    const body = await parseJson(req);
    const company = await createCompanyAsAdmin(user._id, body);
    return json(company, { status: 201 });
});