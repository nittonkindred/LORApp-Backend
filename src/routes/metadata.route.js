import { Router } from "express";
import {
  getRegions,
  getKeywords,
  getSubtypes,
  getExpansions,
} from "../controllers/metadata.controller.js";

const router = Router();

router.get("/regions", getRegions);
router.get("/keywords", getKeywords);
router.get("/subtypes", getSubtypes);
router.get("/expansions", getExpansions);

export default router;
