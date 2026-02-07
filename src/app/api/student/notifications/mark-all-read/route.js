import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { markAllNotificationsAsRead } from "@/repositories/notification.repo";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function PATCH(request) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;

    const result = await markAllNotificationsAsRead(user._id);

    return NextResponse.json(
      successResponse(
        { modifiedCount: result.modifiedCount },
        "All notifications marked as read"
      )
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      errorResponse(error.message || "Failed to mark notifications as read", 500),
      { status: 500 }
    );
  }
}
