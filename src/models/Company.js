import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 150,
        index: true
    },

    role: {
        type: String,
        required: true,
        trim: true
    },

    ctc: {
        type: Number,
        required: true,
        min: 0
    },

    eligibleBranches: {
        type: [String],
        required: true,
        enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CHE'],
        validate: {
            validator: v => Array.isArray(v) && v.length > 0,
            message: "At least one eligible branch is required"
        }
    },

    minCgpa: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },

    backlogAllowed: {
        type: Boolean,
        default: false
    },

    applicationDeadline: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["OPEN", "CLOSED"],
        default: "OPEN",
        index: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // ADMIN
        index: true
    }
}, {
    timestamps: true
});

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);