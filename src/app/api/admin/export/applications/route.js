import { NextResponse } from "next/server";

import { requireAuth, requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/utils/apiResponse";
import { exportFilteredApplicationsCsv } from "@/services/application.service";

export const GET = withErrorHandling(async (req) => {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const { user } = authResult;
  const roleError = requireRole("ADMIN")(user);
  if (roleError) return roleError;

  const { searchParams } = new URL(req.url);
  
  // Helper function to get all values for a parameter (handles multiple values)
  const getArrayParam = (key) => {
    const values = searchParams.getAll(key);
    return values.length > 0 ? values : undefined;
  };
  
  const filters = {
    companyId: searchParams.get("companyId") || undefined,
    status: searchParams.get("status") || undefined,
    branch: getArrayParam("branch"),
    minCgpa: searchParams.get("minCgpa") || undefined,
    maxBacklogCount: searchParams.get("maxBacklogCount") || undefined,
    enrollmentSearch: searchParams.get("enrollmentSearch") || undefined,
    yearOfSelection: searchParams.get("yearOfSelection") || undefined,
  };


  const { csvContent, fileName } = await exportFilteredApplicationsCsv(filters);

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
});
