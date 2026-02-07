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

  // If Cloudinary is not configured, assume local storage
  if (!isCloudinaryConfigured()) {
    // For local storage, the publicId is already the public URL
    return NextResponse.json({ 
      url: publicId.startsWith('/') ? publicId : `/${publicId}`,
      expiresIn: null 
    });
  }

  try {
    // Generate a secure signed URL that expires in 1 hour
    const secureUrl = getSecureUrl(publicId, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({ 
      url: secureUrl,
      expiresIn: 3600 
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error generating secure URL:', error);
    }
    return errorResponse("Failed to generate resume URL", { 
      status: 500, 
      errorCode: "URL_GENERATION_FAILED" 
    });
  }
});
