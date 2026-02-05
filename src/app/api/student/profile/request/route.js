import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import profileUpdateRequestService from '@/services/profileUpdateRequest.service';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function POST(request) {
  try {
    await dbConnect();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'STUDENT') {
      return errorResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { requestedChanges } = body;

    if (!requestedChanges || Object.keys(requestedChanges).length === 0) {
      return errorResponse('No changes provided', { status: 400 });
    }

    // Create profile update request
    const updateRequest = await profileUpdateRequestService.createProfileUpdateRequest(
      decoded.userId,
      requestedChanges
    );

    return NextResponse.json(
      successResponse(updateRequest, 'Profile update request submitted successfully. Please wait for admin approval.')
    );
  } catch (error) {
    console.error('Error creating profile update request:', error);
    return errorResponse(error.message || 'Failed to create profile update request', { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'STUDENT') {
      return errorResponse('Unauthorized', { status: 401 });
    }

    // Get student's own requests
    const requests = await profileUpdateRequestService.getStudentRequests(decoded.userId);

    return NextResponse.json(
      successResponse(requests, 'Profile update requests retrieved successfully')
    );
  } catch (error) {
    console.error('Error fetching profile update requests:', error);
    return errorResponse(error.message || 'Failed to fetch profile update requests', { status: 500 });
  }
}
