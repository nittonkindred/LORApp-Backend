import prisma from "../../src/db/prisma.js";
import fs from "fs/promises";
import path from "path";
import { loadCards } from "./cards.js";

export async function importCardSubtypes(cards) {
  console.log("Importing card subtypes...");

  // Load cards
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

  // Load subtypes
  const subtypeMap = new Map(
    (
      await prisma.subtype.findMany({
        select: {
          id: true,
          name: true,
        },
      })
    ).map((subtype) => [subtype.name, subtype.id]),
  );

  for (const card of cards) {
    const cardId = cardMap.get(card.cardCode);

    if (!cardId) {
      console.warn(`Card ${card.cardCode} not found.`);
      continue;
    }

    for (const subtypeName of card.subtypes ?? []) {
      const subtypeId = subtypeMap.get(subtypeName);

      if (!subtypeId) {
        console.warn(
          `Subtype "${subtypeName}" not found for card ${card.cardCode}`,
        );
        continue;
      }
      console.log(
        `Assigning subtype "${subtypeName}" to card ${card.cardCode}`,
      );
      await prisma.cardSubtype.upsert({
        where: {
          cardId_subtypeId: {
            cardId,
            subtypeId,
          },
        },
        update: {},
        create: {
          cardId,
          subtypeId,
        },
      });
    }
  }

  console.log("✅ Card subtypes imported.");
}

async function main() {
  const cards = await loadCards();
  await importCardSubtypes(cards);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
