import mongoose from "mongoose";

const ApplicationLogSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            index: true,
        },

        oldStatus: {
            type: String,
            enum: ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"],
            required: true,
        },

        newStatus: {
            type: String,
            enum: ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"],
            required: true,
        },

        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // ADMIN
            index: true,
        },

        changedAt: {
            type: Date,
            default: Date.now(),
        },

        remark: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: false,
    }
);

export default mongoose.models.ApplicationLog || mongoose.model("ApplicationLog", ApplicationLogSchema);