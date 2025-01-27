import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import randomstring from "randomstring";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OTP_TTL } from "../constants.js";
import { sendEmail } from "../services/email.service.js";
import { sendSMS } from "../services/sms.service.js";

const generateOTP = (len)=> {
  return randomstring.generate({length: len, charset: "numeric"})
}

const isEmailValid = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

const isPhoneValid = (phone) => {
  const phoneRegex = /^\+\d{1,4}\d{10}$/;
  return phoneRegex.test(phone);
}

const registerUser = asyncHandler(async (req, res) => {
  let { username, email, phone, fullName, password } = req.body
  email = email.toLowerCase();
  username = username.toLowerCase();

  
  if ([username, email, phone, fullName, password].some((field) =>
    field?.trim() === "" || !field)) {
      throw new ApiError(400, "All fields are required.")
  }
    
  if (!isEmailValid(email)) {
    throw new ApiError(400, "Invalid email format.");
  }
  if (!isPhoneValid(phone)) {
    throw new ApiError(400, "Invalid phone format. Use E.164 format (e.g., '+1234567890').");
  }

  const existingUser = await User.findOne({
    $or: [
      { username }, { email }, { phone }]
  })

  if (existingUser) {
    throw new ApiError(400, "User with this username, email or phone already exists.")
  }

  const emailOTP = generateOTP(6);
  const phoneOTP = generateOTP(6);

  const hashedEmailOTP = await bcrypt.hash(emailOTP, 10);
  const hashedPhoneOTP = await bcrypt.hash(phoneOTP, 10);

  await OTP.create([
    { email, otp: hashedEmailOTP, type: "email", expiresAt: Date.now() + OTP_TTL * 60 * 1000 },
    { phone, otp: hashedPhoneOTP, type: "phone", expiresAt: Date.now() + OTP_TTL * 60 * 1000 },
  ]);

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

  if (email && !isEmailValid(email)) {
    throw new ApiError(400, "Invalid email format.");
  }
  if (phone && !isPhoneValid(phone)) {
    throw new ApiError(400, "Invalid phone format. Use E.164 format (e.g., '+1234567890').");
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

const regenerateOtp = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    throw new ApiError(400, "Either email or phone is required to regenerate OTP.");
  }

  if (email && !isEmailValid(email)) {
    throw new ApiError(400, "Invalid email format.");
  }
  if (phone && !isPhoneValid(phone)) {
    throw new ApiError(400, "Invalid phone format. Use E.164 format (e.g., '+1234567890').");
  }

  // Find the existing OTP entry for the user
  const otpFilter = email ? { email } : { phone };
  const existingOtp = await OTP.findOne(otpFilter);

  if (!existingOtp) {
    throw new ApiError(404, "No OTP record found for the provided email or phone.");
  }

  // Check rate limiting (1 OTP per minute)
  const now = new Date();
  const timeDifference = Math.floor((now - existingOtp.createdAt) / 1000); // in seconds
  if (timeDifference < 60) {
    throw new ApiError(429, "You can only request a new OTP after 1 minute.");
  }

  // Invalidate the old OTP
  await OTP.deleteOne(otpFilter);

  // Generate a new OTP
  const otp = generateOTP(6);

  // Save the new OTP to the database
  const newOtp = await OTP.create({
    email: email?.toLowerCase(),
    phone,
    otp,
    expiresAt: new Date(Date.now() + OTP_TTL * 60 * 1000), // OTP_TTL minutes
  });

  // Send the OTP via SMS or Email
  if (phone) {
    await sendSMS(phone, `Your new OTP is: ${otp}`);
  } else if (email) {
    await sendEmail(email, "Your New OTP", `Your new OTP is: ${otp}`);
  }

  return res.status(200).json(
    new ApiResponse(200, null, "OTP regenerated and sent successfully.")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  if (!isEmailValid(email)) {
    throw new ApiError(400, "Invalid email format.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Check if the user is verified
  if (!user.verified) {
    throw new ApiError(403, "Account not verified. Please verify your email or phone.");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Failed to generate authentication tokens.");
  }

  // Save the refresh token in the database
  user.refreshToken = refreshToken;
  const savedUser = await user.save();
  const loggedInUser = await User.findById(savedUser._id).select("-password -refreshToken -__v -createdAt -updatedAt");

  const accessTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: process.env.ACCESS_TOKEN_EXPIRY_SECONDS * 1000, // Shorter expiry
  };
  
  const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: process.env.REFRESH_TOKEN_EXPIRY_SECONDS * 1000, // Longer expiry
  };
  
  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully"
      )
    );
  
});

const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Invalidate the refresh token in the database
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  // Clear both cookies in a concise manner
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!decodedToken) {
      throw new ApiError(401, "The refresh token is invalid")
    }

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new ApiError(500, "Failed to generate authentication tokens.");
    }

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    const savedUser = await user.save();
    const loggedInUser = await User.findById(savedUser._id).select("-password -refreshToken -__v -createdAt -updatedAt");

    const accessTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: process.env.ACCESS_TOKEN_EXPIRY_SECONDS * 1000, // Shorter expiry
    };
    
    const refreshTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: process.env.REFRESH_TOKEN_EXPIRY_SECONDS * 1000, // Longer expiry
    };
    
    return res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser },
          "access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "something happened while generating the new access token")
  }
})

export { registerUser, verifyOTP, regenerateOtp, loginUser, logoutUser, refreshAccessToken };