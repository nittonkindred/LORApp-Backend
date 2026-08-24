import * as deckService from "../services/deck.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";

export const getUserDecks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const decks = await deckService.getUserDecks(userId);
  res.json(new ApiResponse(200, decks, "User decks retrieved successfully"));
});
export const getDeckByUserId = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const decks = await deckService.getDeckByUserId(userId);
  res.json(new ApiResponse(200, decks, "User decks retrieved successfully"));
});

export const getDeckById = asyncHandler(async (req, res) => {
  const deckId = req.params.deckId;
  const userId = req.user.id;
  const deck = await deckService.getDeckById(deckId, userId);
  res.json(new ApiResponse(200, deck, "Deck retrieved successfully"));
});

export const getAllPublicDecks = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const publicDecks = await deckService.getAllPublicDecks(page, limit);
  res.json(
    new ApiResponse(200, publicDecks, "Public decks retrieved successfully"),
  );
});

export const createDeck = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const newDeck = await deckService.createDeck(userId);
  res
    .status(201)
    .json(new ApiResponse(201, newDeck, "Deck created successfully"));
});

export const addCardToDeck = asyncHandler(async (req, res) => {
  const { deckId, cardId } = req.params;
  const deckCard = await deckService.addCardToDeck(deckId, req.user.id, cardId);
  res
    .status(201)
    .json(new ApiResponse(201, deckCard, "Card added to deck successfully"));
});

export const removeCardFromDeck = asyncHandler(async (req, res) => {
  const { deckId, cardId } = req.params;
  const deckCard = await deckService.removeCardFromDeck(
    deckId,
    req.user.id,
    cardId,
  );
  res.json(
    new ApiResponse(200, deckCard, "Card removed from deck successfully"),
  );
});

export const deleteDeck = asyncHandler(async (req, res) => {
  const result = await deckService.deleteDeck(req.params.deckId, req.user.id);
  res.json(new ApiResponse(200, result, "Deck deleted successfully"));
});

export const validateDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const userId = req.user.id;

  const result = await deckService.validateDeck(deckId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Deck validation completed"));
});

export const getDeckBuilder = asyncHandler(async (req, res) => {
  const { deckId } = req.params;

  const data = await deckService.getDeckBuilder(deckId, req.user.id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "Deck builder data retrieved successfully"),
    );
});
export const searchBuilderCardsController = asyncHandler(async (req, res) => {
  const { deckId } = req.params;

  const result = await searchBuilderCards(deckId, req.user.id, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Builder cards retrieved successfully"));
});
export const generateDeckCode = asyncHandler(async (req, res) => {
  const { deckId } = req.params;

  const result = await deckService.generateDeckCode(deckId, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Deck code generated successfully"));
});

export const publishDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const deck = await deckService.publishDeck(deckId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, deck, "Deck published successfully"));
});

export const unpublishDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const deck = await deckService.unpublishDeck(deckId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, deck, "Deck unpublished successfully"));
});

export const importDeckFromCode = asyncHandler(async (req, res) => {
  const { deckCode } = req.params;
  const deck = await deckService.importDeckFromCode(req.user.id, deckCode);
  return res
    .status(200)
    .json(new ApiResponse(200, deck, "Deck retrieved successfully by code"));
});

export const favoriteDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const result = await deckService.favoriteDeck(deckId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Deck favorited successfully"));
});

export const unfavoriteDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const result = await deckService.unfavoriteDeck(deckId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Deck unfavorited successfully"));
});

export const getUserFavoriteDecks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const favoriteDecks = await deckService.getUserFavoriteDecks(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        favoriteDecks,
        "User favorite decks retrieved successfully",
      ),
    );
});
