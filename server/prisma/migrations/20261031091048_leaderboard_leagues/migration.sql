-- CreateEnum
CREATE TYPE "LeagueTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leagueTier" "LeagueTier" NOT NULL DEFAULT 'BRONZE';

-- CreateTable
CREATE TABLE "LeaguePlacement" (
    "userId" TEXT NOT NULL,
    "weekKey" DATE NOT NULL,
    "tier" "LeagueTier" NOT NULL,
    "rank" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaguePlacement_pkey" PRIMARY KEY ("userId","weekKey")
);

-- CreateIndex
CREATE INDEX "LeaguePlacement_weekKey_tier_rank_idx" ON "LeaguePlacement"("weekKey", "tier", "rank");

-- AddForeignKey
ALTER TABLE "LeaguePlacement" ADD CONSTRAINT "LeaguePlacement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
