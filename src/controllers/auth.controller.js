import * as userService from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";

export const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.registerUser(req.body);
  return res.json(new ApiResponse(201, user, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const user = await userService.loginUser(req.body);
  return res
    .cookie("accessToken", user.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .json(new ApiResponse(200, user, "User logged in successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user retrieved successfully"),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await userService.logoutUser(req.user.id);
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Refresh token required"));
  }

  const user = await userService.refreshToken(refreshToken);
  return res

    .cookie("accessToken", user.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .json(new ApiResponse(200, user, "Token refreshed successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await userService.forgotPassword(email);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset email sent successfully"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  await userService.resetPassword(token, newPassword);
  return res

    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);
  return res

    .status(200)  

  .json(new ApiResponse(200, null, "Password changed successfully"));
}); 