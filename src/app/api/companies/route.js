import { json, withErrorHandling } from "@/utils/apiResponse";
import { listCompaniesForRequest } from "@/services/company.service";

export const GET = withErrorHandling(async (req) => {
    const companies = await listCompaniesForRequest(req);
    return json(companies, { status: 200 });
});