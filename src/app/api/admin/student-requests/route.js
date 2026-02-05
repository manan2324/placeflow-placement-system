import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import profileUpdateRequestService from '@/services/profileUpdateRequest.service';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function GET(request) {
  try {
    await dbConnect();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return errorResponse('Unauthorized - Admin access required', { status: 403 });
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let requests;
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      requests = await profileUpdateRequestService.getRequestsByStatus(status);
    } else {
      requests = await profileUpdateRequestService.getAllRequests();
    }

    return NextResponse.json(
      successResponse(requests, 'Profile update requests retrieved successfully')
    );
  } catch (error) {
    console.error('Error fetching profile update requests:', error);
    return errorResponse(error.message || 'Failed to fetch profile update requests', { status: 500 });
  }
}
