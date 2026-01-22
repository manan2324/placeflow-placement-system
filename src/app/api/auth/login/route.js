import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { loginSchema } from "@/validators/auth.schema";
import { login } from "@/services/auth.service";
import { rateLimit } from "@/utils/rateLimit";

export const POST = withErrorHandling(async (req) => {
    const rl = rateLimit(req, { keyPrefix: "auth:login", limit: 10, windowMs: 10 * 60 * 1000 });
    if (rl) return rl;

    const body = await parseJson(req);
    const { email, password } = validate(loginSchema, body);

    const result = await login({ email, password });

    return json(
        { message: "Login successful", token: result.token, role: result.role },
        { status: 200 }
    );
});