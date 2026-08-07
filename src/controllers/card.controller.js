import * as cardService from "../services/card.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";

export const getCards = asyncHandler(async (req, res) => {
  const { cards, pagination } = await cardService.getCards(req.query);

  return res.json(
    new ApiResponse(200, cards, "Cards retrieved successfully", pagination),
  );
});

export const getCardByCode = asyncHandler(async (req, res) => {
  const { cardCode } = req.params;

  const card = await cardService.getCardByCode(cardCode);

  return res.json(new ApiResponse(200, card, "Card retrieved successfully"));
});
