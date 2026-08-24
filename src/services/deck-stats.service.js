import prisma from "../db/prisma.js";
import ApiError from "../utils/api-error.js";

export const getDeckStats = async (deckId, userId) => {
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

  const uniqueCards = deck.cards.length;

  let champions = 0;
  let units = 0;
  let spells = 0;
  let landmarks = 0;
  let equipment = 0;

  let totalCost = 0;

  const regionMap = new Map();
  const manaCostMap = new Map();
  const rarityMap = new Map();
  const formatMap = new Map();

  for (const deckCard of deck.cards) {
    const { card, count } = deckCard;

    switch (card.cardType) {
      case "CHAMPION":
        champions += count;
        break;

      case "UNIT":
        units += count;
        break;

      case "SPELL":
        spells += count;
        break;

      case "LANDMARK":
        landmarks += count;
        break;

      case "EQUIPMENT":
        equipment += count;
        break;
    }

    totalCost += card.cost * count;

    manaCostMap.set(card.cost, (manaCostMap.get(card.cost) ?? 0) + count);

    rarityMap.set(card.rarity, (rarityMap.get(card.rarity) ?? 0) + count);

    formatMap.set(card.format, (formatMap.get(card.format) ?? 0) + count);

    for (const cardRegion of card.regions) {
      const existing = regionMap.get(cardRegion.region.id) ?? {
        id: cardRegion.region.id,
        code: cardRegion.region.code,
        name: cardRegion.region.name,
        count: 0,
      };

      existing.count += count;
      regionMap.set(cardRegion.region.id, existing);
    }
  }

  const maxManaCost = Math.max(
    ...deck.cards.map((deckCard) => deckCard.card.cost),
    0,
  );

  const manaCost = Array.from({ length: maxManaCost + 1 }, (_, cost) => ({
    cost,
    count: manaCostMap.get(cost) ?? 0,
  }));

  const rarities = ["COMMON", "RARE", "EPIC", "CHAMPION", "NONE"].map(
    (rarity) => ({
      rarity,
      count: rarityMap.get(rarity) ?? 0,
    }),
  );

  const formats = ["STANDARD", "ETERNAL"].map((format) => ({
    format,
    count: formatMap.get(format) ?? 0,
  }));

  const averageCost =
    totalCards > 0 ? Number((totalCost / totalCards).toFixed(2)) : 0;

  return {
    totalCards,
    uniqueCards,

    champions,
    units,
    spells,
    landmarks,
    equipment,

    regions: [...regionMap.values()]
      .map((region) => ({
        id: region.id,
        code: region.code,
        name: region.name,
        count: region.count,
      }))
      .sort((a, b) => b.count - a.count),

    manaCost,
    rarities,
    formats,

    averageCost,
  };
};
