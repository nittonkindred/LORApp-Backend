import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";

export const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.registerUser(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const user = await userService.loginUser(req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User logged in successfully"));
});
