import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import profileUpdateRequestService from '@/services/profileUpdateRequest.service';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { notifyProfileUpdate } from '@/utils/notification';

export async function PUT(request, { params }) {
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

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return errorResponse('Invalid action. Must be "approve" or "reject"', { status: 400 });
    }

    let updatedRequest;
    if (action === 'approve') {
      updatedRequest = await profileUpdateRequestService.approveRequest(id, decoded.userId);
      
      // Send approval notification to student
      await notifyProfileUpdate(
        updatedRequest.studentId._id || updatedRequest.studentId,
        'approved'
      );
    } else {
      if (!rejectionReason) {
        return errorResponse('Rejection reason is required', { status: 400 });
      }
      updatedRequest = await profileUpdateRequestService.rejectRequest(id, decoded.userId, rejectionReason);
      
      // Send rejection notification to student with reason
      await notifyProfileUpdate(
        updatedRequest.studentId._id || updatedRequest.studentId,
        'rejected',
        rejectionReason
      );
    }

    return NextResponse.json(
      successResponse(
        updatedRequest,
        `Profile update request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      )
    );
  } catch (error) {
    console.error('Error updating profile request:', error);
    return errorResponse(error.message || 'Failed to update profile request', { status: 500 });
  }
}
