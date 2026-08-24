import prisma from "../db/prisma.js";
import ApiError from "../utils/api-error.js";

export const getCards = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;
  const sortableFields = ["name", "cost", "attack", "health"];
  const { region, cost, type, rarity, set, keyword, subtype, spellSpeed } =
    query;
  const sort = sortableFields.includes(query.sort) ? query.sort : "createdAt";
  const order = query.order === "desc" ? "desc" : "asc";
  const q = query.q?.trim() || "";

  const where = {
    ...(q && {
      OR: [
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          cardCode: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    }),
    ...(region && {
      regions: {
        some: {
          region: {
            code: region,
          },
        },
      },
    }),
    ...(cost && { cost: Number(cost) }),
    ...(type && { cardType: type }),
    ...(rarity && { rarity }),
    ...(set && {
      sets: {
        some: {
          set: {
            code: set,
          },
        },
      },
    }),
    ...(keyword && {
      keywords: {
        some: {
          keyword: {
            code: keyword,
          },
        },
      },
    }),
    ...(subtype && {
      subtypes: {
        some: {
          subtype: {
            code: subtype,
          },
        },
      },
    }),
    ...(spellSpeed && { spellSpeed }),
  };
  if (minCost || maxCost) {
    where.cost = {};

    if (minCost) {
      where.cost.gte = Number(minCost);
    }

    if (maxCost) {
      where.cost.lte = Number(maxCost);
    }
  }
  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      skip,
      take: limit,
      orderBy: {
        [sort]: order,
      },
      where,
    }),
    prisma.card.count({ where }),
  ]);
  return {
    cards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCardByCode = async (cardCode) => {
  const card = await prisma.card.findUnique({
    where: {
      cardCode,
    },
    include: {
      expansions: {
        include: {
          expansion: true,
        },
      },

      regions: {
        include: {
          region: true,
        },
      },

      keywords: {
        include: {
          keyword: true,
        },
      },

      subtypes: {
        include: {
          subtype: true,
        },
      },
      sourceAssociations: {
        include: {
          targetCard: true,
        },
      },

      targetAssociations: {
        include: {
          sourceCard: true,
        },
      },
    },
  });

  if (!card) {
    throw new ApiError(404, "Card not found");
  }

  return card;
};
