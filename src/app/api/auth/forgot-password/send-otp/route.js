import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { forgotPasswordSendOtpSchema } from "@/validators/auth.schema";
import { requestPasswordResetOtp } from "@/services/passwordReset.service";

export const POST = withErrorHandling(async (req) => {
  const body = await parseJson(req);
  const { email } = validate(forgotPasswordSendOtpSchema, body);

  const result = await requestPasswordResetOtp(email);

  return json(result, { status: 200 });
});
