import { NextResponse } from 'next/server';
import { requireAuth } from "@/lib/auth";
import { getSecureUrl, isCloudinaryConfigured } from "@/lib/cloudinary";
import { errorResponse, withErrorHandling } from "@/utils/apiResponse";

/**
 * Get secure URL for accessing a resume
 * GET /api/student/resume/view?id=publicId
 * 
 * This is used when resumes are stored in Cloudinary (production)
 * to generate temporary signed URLs for secure access
 */
export const GET = withErrorHandling(async (req) => {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get('id');

  if (!publicId) {
    return errorResponse("Resume ID is required", { status: 400, errorCode: "MISSING_ID" });
  }

  // If it's a local path (starts with /), return as-is
  if (publicId.startsWith('/')) {
    return NextResponse.json({ 
      url: publicId,
      expiresIn: null 
    });
  }

  // If Cloudinary is not configured, assume it's a local path
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ 
      url: publicId.startsWith('/') ? publicId : `/${publicId}`,
      expiresIn: null 
    });
  }

  // For Cloudinary files, return proxy URL for inline viewing
  // Include token in URL since direct browser navigation can't send headers
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  
  const baseUrl = new URL(req.url).origin;
  return NextResponse.json({ 
    url: `${baseUrl}/api/student/resume/serve?id=${encodeURIComponent(publicId)}&token=${token}`,
    expiresIn: null
  });
});
