import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import randomstring from "randomstring";
import bcrypt from "bcrypt";
import { OTP_TTL } from "../constants.js";
import { sendEmail } from "../services/email.service.js";
import { sendSMS } from "../services/sms.service.js";

const generateOTP = (len)=> {
  return randomstring.generate({length: len, charset: "numeric"})
}

const registerUser = asyncHandler(async (req, res) => {
  let { username, email, phone, fullName, password } = req.body
  email = email.toLowerCase();
  username = username.toLowerCase();

  if ([username, email, phone, fullName, password].some((field) =>
    field?.trim() === "" || !field)) {
    throw new ApiError(400, "All fields are required.")
  }
  
  const existingUser = await User.findOne({
    $or: [
      { username }, { email }, { phone }]
  })

  if (existingUser) {
    throw new ApiError(400, "User with this username, email or password already exists.")
  }

  const emailOTP = generateOTP(6);
  const phoneOTP = generateOTP(6);

  const hashedEmailOTP = await bcrypt.hash(emailOTP, 10);
  const hashedPhoneOTP = await bcrypt.hash(phoneOTP, 10);

  await OTP.create([
    { email, otp: hashedEmailOTP, type: "email", expiresAt: Date.now() + OTP_TTL * 60 * 1000 },
    { phone, otp: hashedPhoneOTP, type: "phone", expiresAt: Date.now() + OTP_TTL * 60 * 1000 },
  ]);

  const user = await User.create({
    username,
    email,
    phone,
    fullName,
    password,
    emailVerified: false,
    phoneVerified: false,
    verified: false
  })

  // Send OTPs via email and phone
  await sendEmail(
    email,
    "Your Email OTP",
    `Your email OTP is ${emailOTP}. It is valid for ${OTP_TTL} minutes.`
  );
  await sendSMS(
    phone,
    `Your phone OTP is ${phoneOTP}. It is valid for ${OTP_TTL} minutes.`
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -verified -__v -createdAt -updatedAt"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully. Please verify your email and phone.")
  )
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, phone, otp } = req.body;

  if ((!email && !phone) || !otp) {
    throw new ApiError(400, "Email or phone and OTP are required.");
  }

  const otpEntry = await OTP.findOne({
    $or: [{ email }, { phone }],
    type: email ? "email" : "phone",
  });

  if (!otpEntry) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  const isMatch = await bcrypt.compare(otp, otpEntry.otp);
  if (!isMatch) {
    throw new ApiError(400, "Invalid OTP.");
  }

  // Find the user and update the verified field
  const updateField = email ? { emailVerified: true } : { phoneVerified: true };
  const user = await User.findOneAndUpdate(
    { $or: [{ email }, { phone }] },
    updateField,
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "User not found.");
  }

  // Check if both email and phone are verified
  if (user.emailVerified && user.phoneVerified) {
    user.verified = true;
    await user.save();
  }

  // Clean up OTP entry after successful verification
  await OTP.deleteOne({ _id: otpEntry._id });

  return res.status(200).json(
    new ApiResponse(200, null, `${email ? "Email" : "Phone"} verified successfully.`)
  );
});

const loginUser = asyncHandler(async (req, res) => {


});


export { registerUser, loginUser, verifyOTP };