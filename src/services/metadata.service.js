import prisma from "../db/prisma.js";

export const getRegions = async () => {
  return prisma.region.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      icon: true,
      color: true,
    },
  });
};

export const getKeywords = async () => {
  return prisma.keyword.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
    },
  });
};

export const getSubtypes = async () => {
  return prisma.subtype.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
};

export const getExpansions = async () => {
  return prisma.expansion.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      icon: true,
    },
  });
};
