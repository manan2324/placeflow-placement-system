import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { getStudentApplicationDetails } from "@/services/application.service";

export const GET = withErrorHandling(async (req, { params }) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    const roleError = requireRole("STUDENT")(user);
    if (roleError) return roleError;

    const { id } = await params;
    const response = await getStudentApplicationDetails({ 
        userId: user._id, 
        applicationId: id 
    });
    
    return json(response, { status: 200 });
});
