import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { applyToCompany } from "@/services/application.service";
import { rateLimit } from "@/utils/rateLimit";

export const POST = withErrorHandling(async (req, { params }) => {
    const rl = await rateLimit(req, { keyPrefix: "student:apply", limit: 30, windowMs: 10 * 60 * 1000 });
    if (rl) return rl;

    // auth
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const roleError = requireRole("STUDENT")(user);
    if (roleError) return roleError;

    const { companyId } = await params;
    const { applicationId } = await applyToCompany({
        userId: user._id,
        companyId
    });

    return json(
        { message: "Application submitted successfully", applicationId },
        { status: 201 }
    );
});