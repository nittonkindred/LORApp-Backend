import * as metadataService from "../services/metadata.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";

export const getRegions = asyncHandler(async (_req, res) => {
  const regions = await metadataService.getRegions();

  return res.json(
    new ApiResponse(200, regions, "Regions retrieved successfully"),
  );
});

export const getKeywords = asyncHandler(async (_req, res) => {
  const keywords = await metadataService.getKeywords();

  return res.json(
    new ApiResponse(200, keywords, "Keywords retrieved successfully"),
  );
});

export const getSubtypes = asyncHandler(async (_req, res) => {
  const subtypes = await metadataService.getSubtypes();

  return res.json(
    new ApiResponse(200, subtypes, "Subtypes retrieved successfully"),
  );
});

export const getExpansions = asyncHandler(async (_req, res) => {
  const expansions = await metadataService.getExpansions();

  return res.json(
    new ApiResponse(200, expansions, "Expansions retrieved successfully"),
  );
});
