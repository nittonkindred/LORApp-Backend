-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "format" "Format";

-- CreateTable
CREATE TABLE "DeckFavorite" (
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeckFavorite_pkey" PRIMARY KEY ("userId","deckId")
);

-- CreateIndex
CREATE INDEX "DeckFavorite_deckId_idx" ON "DeckFavorite"("deckId");

-- AddForeignKey
ALTER TABLE "DeckFavorite" ADD CONSTRAINT "DeckFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckFavorite" ADD CONSTRAINT "DeckFavorite_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
