import asyncHandler from "../utils/async-handler.js";
import * as deckStatsService from "../services/deck-stats.service.js";
import ApiResponse from "../utils/api-response.js";

export const getDeckStats = asyncHandler(async (req, res) => {
  const { deckId } = req.params;

  const data = await deckStatsService.getDeckStats(deckId, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Deck stats retrieved successfully"));
});
