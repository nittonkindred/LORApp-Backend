import prisma from "../../src/db/prisma.js";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.resolve("data");
async function loadCards() {
  const folders = await fs.readdir(DATA_DIR);

  let cards = [];

  for (const folder of folders) {
    if (!folder.startsWith("set")) continue;

    const jsonPath = path.join(DATA_DIR, folder,"en_us", "data", `${folder}.json`);

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

export async function importSubtypes(cards) {
  console.log("Importing subtypes...");

  // Store unique subtype names
  const uniqueSubtypes = new Set();

  // Collect all subtype names
  for (const card of cards) {
    if (!card.subtypes || card.subtypes.length === 0) {
      continue;
    }

    for (const subtype of card.subtypes) {
      uniqueSubtypes.add(subtype);
    }
  }

  console.log(`Found ${uniqueSubtypes.size} unique subtypes.`);

  // Import into database
  for (const subtypeName of uniqueSubtypes) {
    await prisma.subtype.upsert({
      where: {
        name: subtypeName,
      },
      update: {},
      create: {
        name: subtypeName,
      },
    });
  }

  console.log("✅ Subtypes imported successfully.");
}

async function main() {
  const cards = await loadCards();
  await importSubtypes(cards);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
