import { NextResponse } from 'next/server';
import { requireAuth } from "@/lib/auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { errorResponse, withErrorHandling } from "@/utils/apiResponse";
import cloudinary from "@/lib/cloudinary";

/**
 * Serve resume with proper headers for inline viewing
 * GET /api/student/resume/serve?id=publicId
 */
export const GET = withErrorHandling(async (req) => {
  // Get token from query param (for direct browser navigation) or header
  const { searchParams } = new URL(req.url);
  const tokenFromQuery = searchParams.get('token');
  const publicId = searchParams.get('id');
  
  // If token is in query param, create a modified request with it in the header
  let authResult;
  if (tokenFromQuery) {
    // Create a new Headers object with the token
    const modifiedHeaders = new Headers(req.headers);
    modifiedHeaders.set('authorization', `Bearer ${tokenFromQuery}`);
    
    // Create a modified request-like object for auth
    const modifiedReq = {
      headers: {
        get: (key) => modifiedHeaders.get(key)
      }
    };
    authResult = await requireAuth(modifiedReq);
  } else {
    authResult = await requireAuth(req);
  }
  
  if (authResult.error) return authResult.error;

  if (!publicId) {
    return errorResponse("Resume ID is required", { status: 400, errorCode: "MISSING_ID" });
  }

  // If it's a local path, redirect to it
  if (publicId.startsWith('/')) {
    return NextResponse.redirect(new URL(publicId, req.url));
  }

  // If Cloudinary is not configured, treat as local
  if (!isCloudinaryConfigured()) {
    const localUrl = publicId.startsWith('/') ? publicId : `/${publicId}`;
    return NextResponse.redirect(new URL(localUrl, req.url));
  }

  try {
    // Get the Cloudinary file URL (signed, private)
    const { v2: cloudinaryClient } = await import('cloudinary');
    
    cloudinaryClient.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    // Generate signed URL
    const signedUrl = cloudinaryClient.url(publicId, {
      resource_type: 'raw',
      type: 'private',
      sign_url: true,
      secure: true,
    });

    // Fetch the file from Cloudinary
    const response = await fetch(signedUrl);
    
    if (!response.ok) {
      return errorResponse("Failed to fetch resume", { 
        status: response.status, 
        errorCode: "FETCH_FAILED" 
      });
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const buffer = await response.arrayBuffer();

    // Return with inline Content-Disposition header (no filename to prevent download)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error serving resume:', error);
    }
    return errorResponse("Failed to serve resume", { 
      status: 500, 
      errorCode: "SERVE_FAILED" 
    });
  }
});
