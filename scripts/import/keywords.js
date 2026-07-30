import fs from "fs/promises";
import path from "path";
import prisma from "../../src/db/prisma.js";
import { loadCards } from "./cards.js";
const DATA_DIR = path.resolve("data");
let keywords = [];

async function loadKeywords() {
  const folders = await fs.readdir(DATA_DIR);
  const coreFolder = folders.find((folder) =>
    folder.toLowerCase().includes("core"),
  );

  if (coreFolder) {
    const jsonPath = path.join(
      DATA_DIR,
      coreFolder,
      "en_us",
      "data",
      `globals-en_us.json`,
    );

    const json = JSON.parse(await fs.readFile(jsonPath, "utf8"));
    keywords.push(...json.keywords);
  }
  return keywords;
}

async function importKeywords(keywords, cards) {
  const usedKeywords = new Set();

  for (const card of cards) {
    for (const keyword of card.keywordRefs ?? []) {
      usedKeywords.add(keyword);
    }
  }
  for (const keyword of keywords) {
    if (!usedKeywords.has(keyword.nameRef)) {
      continue;
    }
    // keyword objects use `nameRef` as the keyword code
    const existingKeyword = await prisma.keyword.findUnique({
      where: { code: keyword.nameRef },
    });

    if (existingKeyword) {
      console.log(
        `Keyword with code ${keyword.nameRef} already exists. Skipping.`,
      );
      continue;
    }
    console.log(`Importing keyword: ${keyword.name} (${keyword.nameRef})`);
    await prisma.keyword.create({
      data: {
        code: keyword.nameRef,
        name: keyword.name,
        description: keyword.description,
      },
    });
  }
}

async function main() {
  const keywords = await loadKeywords();
  const cards = await loadCards();
  await importKeywords(keywords, cards);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
