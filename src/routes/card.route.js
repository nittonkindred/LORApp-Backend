import { Router } from "express";
import { getCards, getCardByCode } from "../controllers/card.controller.js";
import {
  authMiddleware,
  validateCardQuery,
} from "../middlewares/validatorMiddleware.js";
const router = Router();
router.use(authMiddleware); // Apply authMiddleware to all routes in this router
router.use(validateCardQuery); // Apply validateCardQuery middleware to all routes in this router
router.get("/", getCards);
router.get("/detail/:cardCode", getCardByCode);

export default router;
