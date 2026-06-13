import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { verifyOtpSchema } from "@/validators/auth.schema";
import { verifyPasswordResetOtp } from "@/services/passwordReset.service";

export const POST = withErrorHandling(async (req) => {
  const body = await parseJson(req);
  const { email, otp } = validate(verifyOtpSchema, body);

  const result = await verifyPasswordResetOtp({ email, otp });

  return json(result, { status: 200 });
});
