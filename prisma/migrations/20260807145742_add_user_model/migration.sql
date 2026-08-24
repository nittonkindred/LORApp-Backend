/*
  Warnings:

  - You are about to drop the column `description` on the `Expansion` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Expansion` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the `CardAsset` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Keyword` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Keyword` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CardAsset" DROP CONSTRAINT "CardAsset_cardId_fkey";

-- DropIndex
DROP INDEX "Keyword_name_key";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "fullImageUrl" TEXT,
ADD COLUMN     "gameImageUrl" TEXT;

-- AlterTable
ALTER TABLE "Expansion" DROP COLUMN "description",
DROP COLUMN "releaseDate";

-- AlterTable
ALTER TABLE "Keyword" DROP COLUMN "icon",
ADD COLUMN     "code" TEXT NOT NULL;

-- DropTable
DROP TABLE "CardAsset";

-- DropEnum
DROP TYPE "AssetType";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_code_key" ON "Keyword"("code");
