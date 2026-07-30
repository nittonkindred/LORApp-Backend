import fs from "fs/promises";
import path from "path";
import prisma from "../../src/db/prisma.js";

const DATA_DIR = path.resolve("data");
let expansions = [];

function getExpansionIcon(nameRef) {
  // Use the public-facing path so the deployed client can fetch the icon
  return `/img/sets/${nameRef.toLowerCase()}.png`;
}

async function loadExpansions() {
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
    expansions.push(...json.sets);
    for (const expansion of expansions) {
      expansion.icon = getExpansionIcon(expansion.nameRef);
    }
    console.log(expansions);
  }

  return expansions;
}

async function importExpansions(expansions) {
  console.log(process.env.DATABASE_URL);
  for (const expansion of expansions) {
    // expansion objects use `nameRef` as the expansion code
    const existingExpansion = await prisma.expansion.findUnique({
      where: { code: expansion.nameRef },
    });

    if (existingExpansion) {
      console.log(
        `Expansion with code ${expansion.code} already exists. Skipping.`,
      );
      continue;
    }

    await prisma.expansion.create({
      data: {
        code: expansion.nameRef,
        name: expansion.name,
        icon: expansion.icon,
      },
    });

    console.log(`Imported expansion: ${expansion.name}`);
  }
}

async function main() {
  const expansions = await loadExpansions();

  console.log(`Found expansions: ${expansions.length}`);
  await importExpansions(expansions);
}

main().catch(console.error);

/*model Expansion {
  id          String    @id @default(uuid())
  code        String    @unique
  name        String
  icon        String?

  // Relations
  cards Card[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}*/
