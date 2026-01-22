import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true,
        minLength: 60
    },
    role: {
        type: String,
        enum: ['STUDENT', 'ADMIN'],
        default: 'STUDENT'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);