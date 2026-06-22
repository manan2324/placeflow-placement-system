import { requireAuth, requireRole } from "@/lib/auth";
import { errorResponse, json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { updateApplicationStatusSchema } from "@/validators/application.schema";
import { updateApplicationStatus } from "@/services/application.service";
import { rateLimit } from "@/utils/rateLimit";

export const PATCH = withErrorHandling(async (req, { params }) => {
    const rl = await rateLimit(req, { keyPrefix: "admin:application-status", limit: 60, windowMs: 60 * 1000 });
    if (rl) return rl;

    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const roleError = requireRole("ADMIN")(user);
    if (roleError) return roleError;

    const body = await parseJson(req);

    if (!body?.status) {
        return errorResponse("New status is required", { status: 400, errorCode: "MISSING_STATUS" });
    }

    const parsed = validate(updateApplicationStatusSchema, body);

    const resolvedParams = await params;
    const result = await updateApplicationStatus({
        adminUserId: user._id,
        applicationId: resolvedParams.id,
        newStatus: parsed.status,
        remark: parsed.remark,
    });

    return json(result, { status: 200 });
});