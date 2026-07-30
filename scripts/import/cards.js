import prisma from "../../src/db/prisma.js";
import fs from "fs/promises";
import path from "path";

export async function loadCards() {
  const DATA_DIR = path.resolve("data");
  const folders = await fs.readdir(DATA_DIR);

  let cards = [];

  for (const folder of folders) {
    if (!folder.startsWith("set")) continue;

    const jsonPath = path.join(
      DATA_DIR,
      folder,
      "en_us",
      "data",
      `${folder}.json`,
    );

    try {
      const json = JSON.parse(await fs.readFile(jsonPath, "utf8"));

      cards.push(...json);

      console.log(`Loaded ${json.length} cards from ${folder}`);
    } catch {
      console.warn(`Skipping ${folder}`);
    }
  }

  return cards;
}

export const cardTypeMap = {
  Unit: "UNIT",
  Spell: "SPELL",
  Landmark: "LANDMARK",
  Equipment: "EQUIPMENT",
  Champion: "CHAMPION",
  Ability: "ABILITY",
  Trap: "TRAP",
};
export const formatMap = {
  Standard: "STANDARD",
  Eternal: "ETERNAL",
};

export async function importCards(cards) {
  console.log("Importing cards...");

  for (const card of cards) {
    const expansion = await prisma.expansion.findUnique({
      where: {
        code: card.set,
      },
    });

    if (!expansion) {
      console.warn(`Expansion ${card.set} not found.`);
      continue;
    }

    const cardData = {
      cardCode: card.cardCode,

      name: card.name,

      description: card.descriptionRaw ?? card.description,

      levelUpDescription:
        card.levelupDescriptionRaw ?? card.levelupDescription ?? null,

      flavorText: card.flavorText,

      cost: card.cost,

      attack: card.attack,

      health: card.health,

      collectible: card.collectible,

      isToken: !card.collectible,

      artistName: card.artistName,

      expansionId: expansion.id,

      cardType: cardTypeMap[card.type],

      rarity: card.rarity?.toUpperCase() ?? "NONE",

      format: card.formats?.length > 1 ? "STANDARD" : "ETERNAL",
      spellSpeed:
        card.spellSpeed && card.spellSpeed.trim() !== ""
          ? card.spellSpeed.toUpperCase()
          : null,
      gameImageUrl: card.assets?.[0]?.gameAbsolutePath ?? null,
      fullImageUrl: card.assets?.[0]?.fullAbsolutePath ?? null,
    };

    await prisma.card.upsert({
      where: {
        cardCode: card.cardCode,
      },

      update: cardData,

      create: cardData,
    });
  }

  console.log("Cards imported.");
}

async function main() {
  const cards = await loadCards();
  await importCards(cards);
}

main().then(() => {
  console.log("✅ Cards imported successfully.");
  process.exit(0);
});
