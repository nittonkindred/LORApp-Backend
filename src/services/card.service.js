import prisma from "../db/prisma.js";
import ApiError from "../utils/api-error.js";

export const getCards = (query) => {
    const page = Number(query.page) || 1;
const limit = Number(query.limit) || 20;
const skip = (page - 1) * limit;

 const [cards, total] = await Promise.all([
    prisma.card.findMany({
      skip,
      take: limit,
    }),
    prisma.card.count(),
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
  });

  if (!card) {
    throw new ApiError(404, "Card not found");
  }

  return card;
};

export const searchCards = ({ keyword = "" }) => {
  return prisma.card.findMany({
    where: keyword
      ? {
          OR: [
            {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          ],
        }
      : {},
  });
};
