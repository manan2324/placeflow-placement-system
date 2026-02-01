import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
        required: true,
        index: true,
    },

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true,
    },

    status: {
        type: String,
        enum: ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"],
        default: "APPLIED",
        index: true,
    },

    snapshot: {
        branch: {
            type: String,
            required: true,
        },
        cgpa: {
            type: Number,
            required: true,
            min: 0,
            max: 10,
        },
        backlogCount: {
            type: Number,
            required: true,
            min: 0,
            max: 10,
        },
    },

    appliedAt: {
        type: Date,
        default: Date.now,
    },

    lastUpdatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false
});

ApplicationSchema.index(
    { studentId: 1, companyId: 1 }, 
    { unique: true }
);

ApplicationSchema.pre('save', function () {
    this.lastUpdatedAt = new Date();
});

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);