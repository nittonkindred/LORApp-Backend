import fs from "fs/promises";
import path from "path";

const BASE_URL = "https://dd.b.pvp.net/latest";

const FILES = [
  "core-en_us.zip",

  "set1-en_us.zip",
  "set2-en_us.zip",
  "set3-en_us.zip",
  "set4-en_us.zip",
  "set5-en_us.zip",
  "set6-en_us.zip",
  "set6cde-en_us.zip",
  "set7-en_us.zip",
  "set7b-en_us.zip",
  "set8-en_us.zip",
  "set9-en_us.zip",
];

const DOWNLOAD_DIR = path.resolve("downloads");

async function ensureDownloadDirectory() {
  await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(fileName) {
  const url = `${BASE_URL}/${fileName}`;
  const outputPath = path.join(DOWNLOAD_DIR, fileName);

  if (await fileExists(outputPath)) {
    console.log(`✓ ${fileName} already exists`);
    return;
  }

  console.log(`Downloading ${fileName}...`);

  const response = await fetch(url);

  if (!response.ok) {
    console.error(`✗ Failed: ${fileName} (${response.status})`);
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  await fs.writeFile(outputPath, buffer);

  console.log(`✓ Saved ${fileName}`);
}

async function main() {
  await ensureDownloadDirectory();

  for (const file of FILES) {
    await downloadFile(file);
  }

  console.log("\nAll downloads finished.");
}

main().catch(console.error);
