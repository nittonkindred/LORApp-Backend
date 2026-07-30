import fs from "fs/promises";
import path from "path";
import prisma from "../../src/db/prisma.js";

const DATA_DIR = path.resolve("data");
let regions = [];

async function loadRegions() {
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
    regions.push(...json.regions);
    console.log(regions);
  }
  return regions;
}

async function importRegions(regions) {
  for (const region of regions) {
    // region objects use `nameRef` as the region code
    const existingRegion = await prisma.region.findUnique({
      where: { code: region.abbreviation },
    });

    if (existingRegion) {
      console.log(
        `Region with code ${region.abbreviation} already exists. Skipping.`,
      );
      continue;
    }

    await prisma.region.create({
      data: {
        code: region.abbreviation,
        name: region.name,
        icon: region.iconAbsolutePath,
      },
    });
  }
}

async function main() {
  const regions = await loadRegions();
  await importRegions(regions);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
