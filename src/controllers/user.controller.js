import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const profile = await userService.getUserProfile(username);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile retrieved successfully"));
});
export const getUserPublicDecks = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const { page, limit } = req.query;

  const result = await userService.getUserPublicDecks(username, page, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "User public decks retrieved successfully"),
    );
});
