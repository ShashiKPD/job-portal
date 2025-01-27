import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: function () { return !this.phone; } },
  phone: { type: String, required: function () { return !this.email; } },
  otp: { type: String, required: true },
  type: { type: String, enum: ["email", "phone"], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL Index
}, { timestamps: true });

export const OTP = mongoose.model("OTP", OTPSchema);
