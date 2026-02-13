import mongoose from "mongoose";

const StudentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, //one-to-one relationship
        index: true
    },

    enrollmentNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },

    branch: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CHE']
    },

    cgpa: {
        type: Number,
        min: 0,
        max: 10
    },

    backlogCount: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },

    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[0-9]{10}$/,
        index: true
    },

    resumeUrl: {
        type: String
    },

    resumeUpdatedAt: {
        type: Date
    },
}, {
    timestamps: true
});

export default mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);