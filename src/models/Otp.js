import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["REGISTRATION"],
    default: "REGISTRATION",
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
