import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {


return res.status(201).json(
  new ApiResponse(201, req.body, "User registered successfully")
)
});

const loginUser = asyncHandler(async (req, res) => {


});


export { registerUser, loginUser };