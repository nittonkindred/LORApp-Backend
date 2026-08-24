/*
  Warnings:

  - You are about to drop the column `description` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the `DeckRegion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeckRegion" DROP CONSTRAINT "DeckRegion_deckId_fkey";

-- DropForeignKey
ALTER TABLE "DeckRegion" DROP CONSTRAINT "DeckRegion_regionId_fkey";

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "description",
DROP COLUMN "format",
DROP COLUMN "isPublic",
DROP COLUMN "name";

-- DropTable
DROP TABLE "DeckRegion";
