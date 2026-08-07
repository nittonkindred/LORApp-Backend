const ALLOWED_QUERY_PARAMS = new Set([
  "page",
  "limit",
  "sort",
  "order",
  "q",
  "region",
  "cost",
  "type",
  "rarity",
  "set",
  "keyword",
  "subtype",
  "spellSpeed",
]);

const SORTABLE_FIELDS = ["name", "cost", "attack", "health", "createdAt"];
const ORDER_VALUES = ["asc", "desc"];
const CARD_TYPES = [
  "CHAMPION",
  "UNIT",
  "SPELL",
  "LANDMARK",
  "EQUIPMENT",
  "ABILITY",
  "TRAP",
];
const RARITIES = ["COMMON", "RARE", "EPIC", "CHAMPION", "NONE"];
const SPELL_SPEEDS = ["BURST", "FAST", "SLOW", "FOCUS"];

const getSingleValue = (query, key) => {
  const value = query[key];
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return null;
  if (typeof value !== "string") return null;
  return value;
};

const addError = (errors, field, message) => {
  errors.push({ field, message });
};

export const validateCardQuery = (req, res, next) => {
  const errors = [];

  for (const key of Object.keys(req.query)) {
    if (!ALLOWED_QUERY_PARAMS.has(key)) {
      addError(errors, key, `Unsupported query parameter: ${key}`);
    }
  }

  const pageRaw = getSingleValue(req.query, "page");
  if (pageRaw === null) {
    addError(errors, "page", "page must be a single integer value");
  } else if (pageRaw !== undefined) {
    const page = Number(pageRaw);
    if (!Number.isInteger(page) || page < 1) {
      addError(
        errors,
        "page",
        "page must be an integer greater than or equal to 1",
      );
    }
  }

  const limitRaw = getSingleValue(req.query, "limit");
  if (limitRaw === null) {
    addError(errors, "limit", "limit must be a single integer value");
  } else if (limitRaw !== undefined) {
    const limit = Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      addError(errors, "limit", "limit must be an integer between 1 and 100");
    }
  }

  const sortRaw = getSingleValue(req.query, "sort");
  if (sortRaw === null) {
    addError(errors, "sort", "sort must be a single string value");
  } else if (
    sortRaw !== undefined &&
    !SORTABLE_FIELDS.includes(sortRaw.trim())
  ) {
    addError(
      errors,
      "sort",
      `sort must be one of: ${SORTABLE_FIELDS.join(", ")}`,
    );
  }

  const orderRaw = getSingleValue(req.query, "order");
  if (orderRaw === null) {
    addError(errors, "order", "order must be a single string value");
  } else if (orderRaw !== undefined) {
    const order = orderRaw.trim().toLowerCase();
    if (!ORDER_VALUES.includes(order)) {
      addError(errors, "order", "order must be either asc or desc");
    } else {
      req.query.order = order;
    }
  }

  const costRaw = getSingleValue(req.query, "cost");
  if (costRaw === null) {
    addError(errors, "cost", "cost must be a single integer value");
  } else if (costRaw !== undefined) {
    const cost = Number(costRaw);
    if (!Number.isInteger(cost) || cost < 0 || cost > 100) {
      addError(errors, "cost", "cost must be an integer between 0 and 100");
    }
  }

  const qRaw = getSingleValue(req.query, "q");
  if (qRaw === null) {
    addError(errors, "q", "q must be a single string value");
  } else if (qRaw !== undefined && qRaw.trim().length > 100) {
    addError(errors, "q", "q must be at most 100 characters long");
  }

  const codeLikeFilters = ["region", "set", "keyword", "subtype"];
  for (const key of codeLikeFilters) {
    const rawValue = getSingleValue(req.query, key);
    if (rawValue === null) {
      addError(errors, key, `${key} must be a single string value`);
      continue;
    }
    if (rawValue !== undefined) {
      const value = rawValue.trim();
      if (value.length === 0 || value.length > 64) {
        addError(errors, key, `${key} must be between 1 and 64 characters`);
      } else {
        req.query[key] = value;
      }
    }
  }

  const enumFilters = [
    ["type", CARD_TYPES],
    ["rarity", RARITIES],
    ["spellSpeed", SPELL_SPEEDS],
  ];

  for (const [key, allowedValues] of enumFilters) {
    const rawValue = getSingleValue(req.query, key);
    if (rawValue === null) {
      addError(errors, key, `${key} must be a single string value`);
      continue;
    }

    if (rawValue !== undefined) {
      const normalizedValue = rawValue.trim().toUpperCase();
      if (!allowedValues.includes(normalizedValue)) {
        addError(
          errors,
          key,
          `${key} must be one of: ${allowedValues.join(", ")}`,
        );
      } else {
        req.query[key] = normalizedValue;
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Bad Request",
      errors,
    });
  }

  return next();
};
