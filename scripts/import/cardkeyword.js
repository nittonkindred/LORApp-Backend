import prisma from "../../src/db/prisma.js";
import fs from "fs/promises";
import path from "path";
import { loadCards } from "./cards.js";

export async function importCardKeywords(cards) {
  console.log("Importing card keywords...");

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

  // Load keywords
  const keywordMap = new Map(
    (
      await prisma.keyword.findMany({
        select: {
          id: true,
          name: true,
        },
      })
    ).map((keyword) => [keyword.name, keyword.id]),
  );

  for (const card of cards) {
    const cardId = cardMap.get(card.cardCode);

    if (!cardId) continue;

    for (const keywordName of card.keywordRefs ?? []) {
      const keywordId = keywordMap.get(keywordName);

      if (!keywordId) {
        console.warn(
          `Keyword "${keywordName}" not found for card ${card.cardCode}`,
        );
        continue;
      }
      console.log(
        `Card ${card.cardCode} has keyword ${keywordName} with ID ${keywordId}`,
      );
      await prisma.cardKeyword.upsert({
        where: {
          cardId_keywordId: {
            cardId,
            keywordId,
          },
        },
        update: {},
        create: {
          cardId,
          keywordId,
        },
      });
    }
  }

  console.log("✅ Card keywords imported.");
}

async function main() {
  const cards = await loadCards();
  await importCardKeywords(cards);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
