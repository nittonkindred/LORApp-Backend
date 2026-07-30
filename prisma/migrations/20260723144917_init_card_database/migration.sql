-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CHAMPION', 'UNIT', 'SPELL', 'LANDMARK', 'EQUIPMENT', 'ABILITY', 'TRAP');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'CHAMPION', 'NONE');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('STANDARD', 'ETERNAL');

-- CreateEnum
CREATE TYPE "SpellSpeed" AS ENUM ('BURST', 'FAST', 'SLOW', 'FOCUS');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('GAME', 'FULL', 'ICON', 'THUMBNAIL');

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "cardCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "levelUpDescription" TEXT,
    "flavorText" TEXT,
    "cost" INTEGER NOT NULL,
    "attack" INTEGER,
    "health" INTEGER,
    "collectible" BOOLEAN NOT NULL DEFAULT true,
    "isToken" BOOLEAN NOT NULL DEFAULT false,
    "artistName" TEXT,
    "expansionId" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "format" "Format" NOT NULL,
    "spellSpeed" "SpellSpeed",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expansion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expansion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtype" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardKeyword" (
    "cardId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,

    CONSTRAINT "CardKeyword_pkey" PRIMARY KEY ("cardId","keywordId")
);

-- CreateTable
CREATE TABLE "CardSubtype" (
    "cardId" TEXT NOT NULL,
    "subtypeId" TEXT NOT NULL,

    CONSTRAINT "CardSubtype_pkey" PRIMARY KEY ("cardId","subtypeId")
);

-- CreateTable
CREATE TABLE "CardRegion" (
    "cardId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "CardRegion_pkey" PRIMARY KEY ("cardId","regionId")
);

-- CreateTable
CREATE TABLE "CardAssociation" (
    "sourceCardId" TEXT NOT NULL,
    "targetCardId" TEXT NOT NULL,

    CONSTRAINT "CardAssociation_pkey" PRIMARY KEY ("sourceCardId","targetCardId")
);

-- CreateTable
CREATE TABLE "CardAsset" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardCode_key" ON "Card"("cardCode");

-- CreateIndex
CREATE UNIQUE INDEX "Expansion_code_key" ON "Expansion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subtype_name_key" ON "Subtype"("name");

-- CreateIndex
CREATE INDEX "CardKeyword_keywordId_idx" ON "CardKeyword"("keywordId");

-- CreateIndex
CREATE INDEX "CardSubtype_subtypeId_idx" ON "CardSubtype"("subtypeId");

-- CreateIndex
CREATE INDEX "CardRegion_regionId_idx" ON "CardRegion"("regionId");

-- CreateIndex
CREATE INDEX "CardAssociation_targetCardId_idx" ON "CardAssociation"("targetCardId");

-- CreateIndex
CREATE INDEX "CardAsset_cardId_idx" ON "CardAsset"("cardId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardKeyword" ADD CONSTRAINT "CardKeyword_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardKeyword" ADD CONSTRAINT "CardKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSubtype" ADD CONSTRAINT "CardSubtype_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSubtype" ADD CONSTRAINT "CardSubtype_subtypeId_fkey" FOREIGN KEY ("subtypeId") REFERENCES "Subtype"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardRegion" ADD CONSTRAINT "CardRegion_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardRegion" ADD CONSTRAINT "CardRegion_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAssociation" ADD CONSTRAINT "CardAssociation_sourceCardId_fkey" FOREIGN KEY ("sourceCardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAssociation" ADD CONSTRAINT "CardAssociation_targetCardId_fkey" FOREIGN KEY ("targetCardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAsset" ADD CONSTRAINT "CardAsset_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
