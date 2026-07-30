import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";

const DOWNLOAD_DIR = path.resolve("downloads");
const DATA_DIR = path.resolve("data");

async function ensureDataDirectory() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function extractZip(zipFile) {
  const zipPath = path.join(DOWNLOAD_DIR, zipFile);

  // Folder name without .zip
  const folderName = zipFile.replace(".zip", "");
  const outputPath = path.join(DATA_DIR, folderName);

  console.log(`Extracting ${zipFile}...`);

  const zip = new AdmZip(zipPath);

  zip.extractAllTo(outputPath, true);

  console.log(`✓ Extracted to data/${folderName}`);
}

async function main() {
  await ensureDataDirectory();

  const files = await fs.readdir(DOWNLOAD_DIR);

  const zipFiles = files.filter((file) => file.endsWith(".zip"));

  if (zipFiles.length === 0) {
    console.log("No ZIP files found.");
    return;
  }

  for (const file of zipFiles) {
    await extractZip(file);
  }

  console.log("\nAll ZIP files extracted successfully.");
}

main().catch(console.error);
