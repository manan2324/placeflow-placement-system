import { requireAuth } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";

export const GET = withErrorHandling(async (req) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    return json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    }, { status: 200 });
});
