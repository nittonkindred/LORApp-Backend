import { Router } from "express";
import {
  getUserDecks,
  getDeckById,
  getAllPublicDecks,
  createDeck,
  addCardToDeck,
  removeCardFromDeck,
  deleteDeck,
  validateDeck,
  getDeckBuilder,
  searchBuilderCards,
  generateDeckCode,
  publishDeck,
  unpublishDeck,
  importDeckFromCode,
  favoriteDeck,
  unfavoriteDeck,
  getUserFavoriteDecks,
} from "../controllers/deck.controller.js";
import { getDeckStats } from "../controllers/deck-stats.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();
router.use(authMiddleware); // Apply authMiddleware to all routes in this router
router.get("/user", getUserDecks);
router.get("/", getAllPublicDecks);
router.post("/", createDeck);
router.post("/:deckId/validate", validateDeck);
router.get("/:deckId", getDeckById);
router.delete("/:deckId", deleteDeck);
router.post("/:deckId/cards/:cardId", addCardToDeck);
router.delete("/:deckId/cards/:cardId", removeCardFromDeck);
router.get("/:deckId/builder", authMiddleware, getDeckBuilder);
router.get(
  "/:deckId/builder/cards",
  authMiddleware,
  searchBuilderCards,
);
router.post("/:deckId/code", authMiddleware, generateDeckCode);
router.post("/:deckId/publish", authMiddleware, publishDeck);
router.post("/:deckId/unpublish", authMiddleware, unpublishDeck);
router.get("/:deckCode", authMiddleware, importDeckFromCode);
router.post("/:deckId/favorite", authMiddleware, favoriteDeck);
router.post("/:deckId/unfavorite", authMiddleware, unfavoriteDeck);
router.get("/favorites", authMiddleware, getUserFavoriteDecks);
router.get("/:deckId/stats", authMiddleware, getDeckStats);
export default router;
