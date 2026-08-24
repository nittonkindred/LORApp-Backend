import prisma from "../db/prisma.js";
import ApiError from "../utils/api-error.js";
import { DeckEncoder } from "runeterra";

export const getUserDecks = async (userId) => {
  return prisma.deck.findMany({
    where: {
      userId,
    },
    include: {
      cards: {
        include: {
          card: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getDeckById = async (deckId, userId) => {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
    },
    include: {
      cards: {
        include: {
          card: true,
        },
      },
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }
  if (!deck.isPublic && deck.userId !== userId) {
    throw new ApiError(403, "You do not have permission to view this deck");
  }

  return deck;
};

export const getAllPublicDecks = async (
  page = 1,
  limit = 10,
  search,
  format,
  region,
  set,
  sort = "newest",
) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const offset = (page - 1) * limit;
  const total = await prisma.deck.count({
    where: {
      isPublic: true,
    },
  });
  const where = {
    isPublic: true,
  };
  if (format) {
    where.format = format;
  }
  if (search) {
    where.OR = [
      {
        user: {
          username: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        cards: {
          some: {
            card: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  if (region) {
    where.cards = {
      some: {
        card: {
          regions: {
            some: {
              region: {
                code: region,
              },
            },
          },
        },
      },
    };
  }
  if (set) {
    where.cards = {
      some: {
        card: {
          expansion: {
            code: set,
          },
        },
      },
    };
  }
  let orderBy;

  switch (sort) {
    case "popular":
      orderBy = {
        favorites: {
          _count: "desc",
        },
      };
      break;

    case "oldest":
      orderBy = {
        createdAt: "asc",
      };
      break;

    case "newest":
    default:
      orderBy = {
        createdAt: "desc",
      };
      break;
  }
  const decks = await prisma.deck.findMany({
    where,
    include: {
      cards: {
        include: {
          card: {
            select: {
              id: true,
              cardCode: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
    orderBy,
    skip: offset,
    take: limit,
  });

  return {
    decks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const addCardToDeck = async (deckId, userId, cardId) => {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId, userId },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      regions: true,
    },
  });

  if (!card) {
    throw new ApiError(404, "Card not found");
  }

  const existingDeckCard = await prisma.deckCard.findUnique({
    where: {
      deckId_cardId: {
        deckId,
        cardId: card.id,
      },
    },
  });

  const currentCount = existingDeckCard?.count ?? 0;
  const newCount = currentCount + 1;

  if (newCount > 3) {
    throw new ApiError(
      400,
      "A deck cannot contain more than 3 copies of a card",
    );
  }

  const deckCards = await prisma.deckCard.findMany({
    where: {
      deckId,
    },
    include: {
      card: {
        include: {
          regions: true,
        },
      },
    },
  });
  const existingRegionIds = new Set();

  for (const deckCard of deckCards) {
    for (const cardRegion of deckCard.card.regions) {
      existingRegionIds.add(cardRegion.regionId);
    }
  }

  // Regions of the new card
  const newRegionIds = card.regions.map((cardRegion) => cardRegion.regionId);
  // Find regions that aren't already in the deck
  const newRegions = newRegionIds.filter(
    (regionId) => !existingRegionIds.has(regionId),
  );

  // Check maximum regions
  const MAX_REGIONS = 2;

  if (existingRegionIds.size + newRegions.length > MAX_REGIONS) {
    throw new ApiError(400, "A deck cannot contain more than 2 regions");
  }
  const totalCards = deckCards.reduce(
    (total, deckCard) => total + deckCard.count,
    0,
  );
  if (totalCards + 1 > 40) {
    throw new ApiError(400, "A deck cannot contain more than 40 cards");
  }
  if (deck.format === "STANDARD" && card.format !== "STANDARD") {
    throw new ApiError(400, "This card is not legal in Standard format");
  }

  const MAX_CHAMPIONS = 6;

  if (card.cardType === "CHAMPION") {
    const championCards = await prisma.deckCard.findMany({
      where: {
        deckId,
        card: {
          cardType: "CHAMPION",
        },
      },
    });

    const championCount = championCards.reduce(
      (total, deckCard) => total + deckCard.count,
      0,
    );

    if (championCount + 1 > MAX_CHAMPIONS) {
      throw new ApiError(
        400,
        `A deck cannot contain more than ${MAX_CHAMPIONS} champions`,
      );
    }
  }
  const deckCard = await prisma.deckCard.upsert({
    where: {
      deckId_cardId: {
        deckId,
        cardId: card.id,
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      deckId,
      cardId: card.id,
      count: 1,
    },
    include: {
      card: true,
    },
  });

  return deckCard;
};

export const removeCardFromDeck = async (deckId, userId, cardId) => {
  // Check that the deck belongs to the current user
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  // Check that the card is actually in the deck
  const deckCard = await prisma.deckCard.findUnique({
    where: {
      deckId_cardId: {
        deckId,
        cardId,
      },
    },
    include: {
      card: true,
    },
  });

  if (!deckCard) {
    throw new ApiError(404, "Card is not in this deck");
  }

  // Delete the DeckCard relationship
  if (deckCard.count === 1) {
    await prisma.deckCard.delete({
      where: {
        deckId_cardId: {
          deckId,
          cardId,
        },
      },
    });

    return {
      ...deckCard,
      count: 0,
    };
  }

  // Otherwise decrease quantity by 1
  const updatedDeckCard = await prisma.deckCard.update({
    where: {
      deckId_cardId: {
        deckId,
        cardId,
      },
    },
    data: {
      count: {
        decrement: 1,
      },
    },
    include: {
      card: true,
    },
  });

  return updatedDeckCard;
};

export const createDeck = async (userId) => {
  const deck = await prisma.deck.create({
    data: {
      userId,
    },
  });

  return deck;
};

export const deleteDeck = async (deckId, userId) => {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  await prisma.deck.delete({
    where: {
      id: deckId,
    },
  });

  return {
    message: "Deck deleted successfully",
  };
};

export const validateDeck = async (deckId, userId) => {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    include: {
      cards: {
        include: {
          card: {
            include: {
              regions: true,
            },
          },
        },
      },
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  const errors = [];

  const totalCards = deck.cards.reduce(
    (total, deckCard) => total + deckCard.count,
    0,
  );

  if (totalCards !== 40) {
    errors.push(`Deck must contain exactly 40 cards (currently ${totalCards})`);
  }

  for (const deckCard of deck.cards) {
    if (deckCard.count > 3) {
      errors.push(
        `${deckCard.card.name} has ${deckCard.count} copies. Maximum is 3.`,
      );
    }
  }

  const MAX_CHAMPIONS = 6;

  const championCount = deck.cards.reduce((total, deckCard) => {
    if (deckCard.card.cardType === "CHAMPION") {
      return total + deckCard.count;
    }

    return total;
  }, 0);

  if (championCount > MAX_CHAMPIONS) {
    errors.push(
      `Deck contains ${championCount} champions. Maximum is ${MAX_CHAMPIONS}.`,
    );
  }

  const regionIds = new Set();

  for (const deckCard of deck.cards) {
    for (const cardRegion of deckCard.card.regions) {
      regionIds.add(cardRegion.regionId);
    }
  }

  const MAX_DECK_REGIONS = 2;

  if (regionIds.size > MAX_DECK_REGIONS) {
    errors.push(
      `Deck contains ${regionIds.size} regions. Maximum is ${MAX_DECK_REGIONS}.`,
    );
  }

  for (const deckCard of deck.cards) {
    const card = deckCard.card;

    if (deck.format === "STANDARD" && card.format !== "STANDARD") {
      errors.push(`${card.name} is not legal in Standard format.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getDeckBuilder = async (deckId, userId) => {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    include: {
      cards: {
        include: {
          card: {
            include: {
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
            },
          },
        },
      },
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  const totalCards = deck.cards.reduce(
    (total, deckCard) => total + deckCard.count,
    0,
  );

  const championCount = deck.cards
    .filter((deckCard) => deckCard.card.cardType === "CHAMPION")
    .reduce((total, deckCard) => total + deckCard.count, 0);

  const regionIds = new Set();

  for (const deckCard of deck.cards) {
    for (const cardRegion of deckCard.card.regions) {
      regionIds.add(cardRegion.regionId);
    }
  }

  return {
    deck: {
      id: deck.id,
      code: deck.code,
      format: deck.format,
    },

    cards: deck.cards,

    stats: {
      totalCards,
      champions: championCount,
      regions: [...regionIds],
    },
  };
};
export const searchBuilderCards = async (deckId, userId, query = {}) => {
  const {
    search,
    region,
    cost,
    minCost,
    maxCost,
    type,
    rarity,
    page = 1,
    limit = 20,
  } = query;

  // 1. Check deck
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  const where = {};

  // 2. Search
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        cardCode: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // 3. Format restriction
  if (deck.format) {
    where.format = deck.format;
  }

  // 4. Region
  if (region) {
    where.regions = {
      some: {
        region: {
          code: region,
        },
      },
    };
  }

  // 5. Exact cost
  if (cost !== undefined) {
    where.cost = Number(cost);
  }

  // 6. Cost range
  if (minCost !== undefined || maxCost !== undefined) {
    where.cost = {};

    if (minCost !== undefined) {
      where.cost.gte = Number(minCost);
    }

    if (maxCost !== undefined) {
      where.cost.lte = Number(maxCost);
    }
  }

  // 7. Card type
  if (type) {
    where.cardType = type;
  }

  // 8. Rarity
  if (rarity) {
    where.rarity = rarity;
  }

  // 9. Pagination
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (pageNumber - 1) * pageLimit;

  const total = await prisma.card.count({
    where,
  });

  const cards = await prisma.card.findMany({
    where,

    include: {
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

      expansion: true,
    },

    orderBy: {
      name: "asc",
    },

    skip,
    take: pageLimit,
  });

  return {
    cards,

    pagination: {
      page: pageNumber,
      limit: pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
};

export const generateDeckCode = async (deckId, userId) => {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    include: {
      cards: {
        include: {
          card: true,
        },
      },
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  if (deck.cards.length === 0) {
    throw new ApiError(400, "Cannot generate code for an empty deck");
  }

  const cards = deck.cards.map((deckCard) => ({
    code: deckCard.card.cardCode,
    count: deckCard.count,
  }));

  const deckCode = DeckEncoder.encode(cards);

  const updatedDeck = await prisma.deck.update({
    where: {
      id: deckId,
    },
    data: {
      code: deckCode,
    },
  });

  return {
    deckId: updatedDeck.id,
    code: updatedDeck.code,
  };
};
export const publishDeck = async (deckId, userId) => {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  // Validate the entire deck
  const validation = await validateDeck(deckId, userId);

  if (!validation.valid) {
    throw new ApiError(
      400,
      `Cannot publish deck: ${validation.errors.join(", ")}`,
    );
  }

  // Generate LoR deck code
  const { code } = await generateDeckCode(deckId, userId);

  // Publish
  const publishedDeck = await prisma.deck.update({
    where: {
      id: deckId,
    },
    data: {
      isPublic: true,
      code,
    },
  });

  return publishedDeck;
};

export const unpublishDeck = async (deckId, userId) => {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  return prisma.deck.update({
    where: {
      id: deckId,
    },
    data: {
      isPublic: false,
    },
  });
};

export const importDeckFromCode = async (userId, deckCode) => {
  if (!deckCode || typeof deckCode !== "string") {
    throw new ApiError(400, "Deck code is required");
  }

  // Decode the LoR deck code
  let decodedCards;

  try {
    decodedCards = DeckEncoder.decode(deckCode.trim());
  } catch (error) {
    throw new ApiError(400, "Invalid deck code");
  }

  if (!decodedCards || decodedCards.length === 0) {
    throw new ApiError(400, "Deck code contains no cards");
  }

  /*
    decodedCards should look like:

    [
      {
        code: "01IO006",
        count: 3
      },
      {
        code: "01IO009",
        count: 3
      }
    ]
  */

  // Find all cards in our database
  const cardCodes = decodedCards.map((item) => item.code);

  const cards = await prisma.card.findMany({
    where: {
      cardCode: {
        in: cardCodes,
      },
    },
  });

  // Create a lookup map
  const cardMap = new Map(cards.map((card) => [card.cardCode, card]));

  // Check whether our database is missing cards
  const missingCards = decodedCards.filter((item) => !cardMap.has(item.code));

  if (missingCards.length > 0) {
    throw new ApiError(
      400,
      `Some cards in the deck are not available in the database`,
    );
  }

  // Create the deck
  const deck = await prisma.deck.create({
    data: {
      userId,
      code: deckCode.trim(),
    },
  });

  // Create DeckCard records
  await prisma.deckCard.createMany({
    data: decodedCards.map((item) => ({
      deckId: deck.id,
      cardId: cardMap.get(item.code).id,
      count: item.count,
    })),
  });

  // Return the complete deck
  return prisma.deck.findUnique({
    where: {
      id: deck.id,
    },
    include: {
      cards: {
        include: {
          card: true,
        },
      },
    },
  });
};
export const favoriteDeck = async (deckId, userId) => {
  const deck = await prisma.deck.findUnique({
    where: {
      id: deckId,
    },
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  if (!deck.isPublic && deck.userId !== userId) {
    throw new ApiError(403, "You cannot favorite this deck");
  }

  const existingFavorite = await prisma.deckFavorite.findUnique({
    where: {
      userId_deckId: {
        userId,
        deckId,
      },
    },
  });

  if (existingFavorite) {
    throw new ApiError(400, "Deck is already in your favorites");
  }

  const favorite = await prisma.deckFavorite.create({
    data: {
      userId,
      deckId,
    },
  });

  return favorite;
};
export const unfavoriteDeck = async (deckId, userId) => {
  const favorite = await prisma.deckFavorite.findUnique({
    where: {
      userId_deckId: {
        userId,
        deckId,
      },
    },
  });

  if (!favorite) {
    throw new ApiError(404, "Deck is not in your favorites");
  }

  await prisma.deckFavorite.delete({
    where: {
      userId_deckId: {
        userId,
        deckId,
      },
    },
  });

  return {
    message: "Deck removed from favorites",
  };
};
export const getUserFavoriteDecks = async (userId) => {
  const favorites = await prisma.deckFavorite.findMany({
    where: {
      userId,
    },

    include: {
      deck: {
        include: {
          cards: {
            include: {
              card: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return favorites;
};
