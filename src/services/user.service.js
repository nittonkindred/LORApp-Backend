import prisma from "../db/prisma.js";
import ApiError from "../utils/api-error.js";

export const getUserProfile = async (username) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
export const getUserPublicDecks = async (username, page = 1, limit = 10) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const offset = (page - 1) * limit;

  // Find the user
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Count public decks
  const total = await prisma.deck.count({
    where: {
      userId: user.id,
      isPublic: true,
    },
  });

  // Get public decks
  const decks = await prisma.deck.findMany({
    where: {
      userId: user.id,
      isPublic: true,
    },

    include: {
      cards: {
        include: {
          card: true,
        },
      },

      _count: {
        select: {
          favorites: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    skip: offset,
    take: limit,
  });

  return {
    user,
    decks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
