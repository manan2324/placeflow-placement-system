import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { resetPasswordSchema } from "@/validators/auth.schema";
import { resetPassword } from "@/services/passwordReset.service";

export const POST = withErrorHandling(async (req) => {
  const body = await parseJson(req);
  const payload = validate(resetPasswordSchema, body);

  const result = await resetPassword(payload);

  return json(result, { status: 200 });
});
