-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "format" "Format" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "DeckRegion" (
    "deckId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "DeckRegion_pkey" PRIMARY KEY ("deckId","regionId")
);

-- CreateIndex
CREATE INDEX "DeckRegion_regionId_idx" ON "DeckRegion"("regionId");

-- AddForeignKey
ALTER TABLE "DeckRegion" ADD CONSTRAINT "DeckRegion_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckRegion" ADD CONSTRAINT "DeckRegion_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
