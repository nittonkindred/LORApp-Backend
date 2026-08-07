import { Router } from "express";
import { getCards, getCardByCode } from "../controllers/card.controller.js";
import { validateCardQuery } from "../middlewares/validatorMiddleware.js";
const router = Router();

router.get("/", validateCardQuery, getCards);
router.get("/:cardCode", getCardByCode);

export default router;
