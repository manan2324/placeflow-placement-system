import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);