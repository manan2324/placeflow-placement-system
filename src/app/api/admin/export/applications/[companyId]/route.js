import { NextResponse } from "next/server";

import { requireAuth, requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/utils/apiResponse";
import { exportCompanyApplicationsCsv } from "@/services/application.service";

export const GET = withErrorHandling(async (req, { params }) => {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const { user } = authResult;
  const roleError = requireRole("ADMIN")(user);
  if (roleError) return roleError;

  const para = await params;
  const { csvContent, fileName } = await exportCompanyApplicationsCsv({
    companyId: para.companyId
  });

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
});
