import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { markNotificationAsRead } from "@/repositories/notification.repo";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { isValidObjectId } from "@/utils/objectId";

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        errorResponse("Invalid notification ID", 400),
        { status: 400 }
      );
    }

    const notification = await markNotificationAsRead(id, user._id);

    if (!notification) {
      return NextResponse.json(
        errorResponse("Notification not found", 404),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse({ notification }, "Notification marked as read")
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      errorResponse(error.message || "Failed to mark notification as read", 500),
      { status: 500 }
    );
  }
}
