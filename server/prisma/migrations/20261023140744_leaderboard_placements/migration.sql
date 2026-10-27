-- AlterTable
ALTER TABLE "LeaderboardGroup" ADD COLUMN     "settledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LeaderboardPlacement" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "organizationId" TEXT,
    "weekKey" DATE NOT NULL,
    "rank" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardPlacement_pkey" PRIMARY KEY ("userId","courseId","weekKey")
);

-- CreateIndex
CREATE INDEX "LeaderboardPlacement_courseId_organizationId_weekKey_idx" ON "LeaderboardPlacement"("courseId", "organizationId", "weekKey");

-- AddForeignKey
ALTER TABLE "LeaderboardPlacement" ADD CONSTRAINT "LeaderboardPlacement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardPlacement" ADD CONSTRAINT "LeaderboardPlacement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
