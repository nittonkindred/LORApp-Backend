import { Router } from "express";
import {
  getCards,
  getCardByCode,
  searchCards,
} from "../controllers/card.controller.js";
const router = Router();

router.get("/", getCards);
router.get("/search", searchCards);
router.get("/:cardCode", getCardByCode);

export default router;
