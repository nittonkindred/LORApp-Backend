import { Router } from "express";
import { getUserProfile, getUserPublicDecks } from "../controllers/user.controller.js";

const router = Router();

router.get("/:username", getUserProfile);
router.get("/:username/decks", getUserPublicDecks);

export default router;
