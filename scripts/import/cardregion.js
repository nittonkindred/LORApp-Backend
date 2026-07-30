import prisma from "../../src/db/prisma.js";
import fs from "fs/promises";
import path from "path";
import { loadCards } from "./cards.js";
export async function importCardRegions(cards) {
  console.log("Importing card regions...");

  const cardMap = new Map(
    (
      await prisma.card.findMany({
        select: {
          id: true,
          cardCode: true,
        },
      })
    ).map((card) => [card.cardCode, card.id]),
  );

  const regionMap = new Map(
    (
      await prisma.region.findMany({
        select: {
          id: true,
          name: true,
        },
      })
    ).map((region) => [region.name, region.id]),
  );
  console.log(regionMap);
  for (const card of cards) {
    const cardId = cardMap.get(card.cardCode);

    if (!cardId) continue;

    for (const regionName of card.regionRefs ?? []) {
      const regionId = regionMap.get(regionName);
      if (!regionId) continue;

      console.log(
        `Card ${card.cardCode} has region ${regionName} with ID ${regionId}`,
      );
      await prisma.cardRegion.upsert({
        where: {
          cardId_regionId: {
            cardId,
            regionId,
          },
        },
        update: {},
        create: {
          cardId,
          regionId,
        },
      });
    }
  }

  console.log("✅ Card regions imported.");
}

async function main() {
  const cards = await loadCards();
  await importCardRegions(cards);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
