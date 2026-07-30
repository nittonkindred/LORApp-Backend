import prisma from "../../src/db/prisma.js";
import fs from "fs/promises";
import path from "path";
import { loadCards } from "./cards.js";

export async function importCardAssociations(cards) {
  console.log("Importing card associations...");

  // Load all cards into memory
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

  for (const card of cards) {
    const sourceCardId = cardMap.get(card.cardCode);

    if (!sourceCardId) {
      console.warn(`Card ${card.cardCode} not found.`);
      continue;
    }

    for (const associatedCardCode of card.associatedCardRefs ?? []) {
      const targetCardId = cardMap.get(associatedCardCode);

      if (!targetCardId) {
        console.warn(
          `Associated card ${associatedCardCode} not found for ${card.cardCode}`,
        );
        continue;
      }

      await prisma.cardAssociation.upsert({
        where: {
          sourceCardId_targetCardId: {
            sourceCardId,
            targetCardId,
          },
        },
        update: {},
        create: {
          sourceCardId,
          targetCardId,
        },
      });
    }
  }

  console.log("✅ Card associations imported.");
}

async function main() {
  const cards = await loadCards();
  await importCardAssociations(cards);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
