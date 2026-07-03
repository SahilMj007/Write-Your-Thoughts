import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowerCase: true, unique: true },
  otp: { type: Number, required: true },
  expireTime: { type: Date, required: true },
});

OtpSchema.index({ expireTime: 1 }, { expireAfterSeconds: 0 });
export const OTP = mongoose.model("OTP", OtpSchema);
