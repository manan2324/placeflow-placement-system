import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getNotificationsByUser, getUnreadCount } from "@/repositories/notification.repo";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET(request) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = parseInt(searchParams.get("skip")) || 0;

    const notifications = await getNotificationsByUser(user._id, { limit, skip });
    const unreadCount = await getUnreadCount(user._id);

    return NextResponse.json(
      successResponse({
        notifications,
        unreadCount,
      })
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      errorResponse(error.message || "Failed to fetch notifications", 500),
      { status: 500 }
    );
  }
}
