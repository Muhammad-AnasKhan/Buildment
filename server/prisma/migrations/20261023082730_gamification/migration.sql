-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "xpTotal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrganizationCourse" ADD COLUMN     "leaderboardEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gamificationHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "streakFreezes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xpTotal" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "XpEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "courseId" TEXT,
    "source" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dayKey" DATE NOT NULL,
    "weekKey" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakFreezeDay" (
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakFreezeDay_pkey" PRIMARY KEY ("userId","date")
);

-- CreateTable
CREATE TABLE "LeaderboardGroup" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "organizationId" TEXT,
    "weekKey" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardMember" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "weekKey" DATE NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardMember_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateIndex
CREATE INDEX "XpEntry_userId_createdAt_idx" ON "XpEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "XpEntry_userId_source_dayKey_idx" ON "XpEntry"("userId", "source", "dayKey");

-- CreateIndex
CREATE INDEX "XpEntry_courseId_weekKey_idx" ON "XpEntry"("courseId", "weekKey");

-- CreateIndex
CREATE UNIQUE INDEX "XpEntry_userId_sourceKey_key" ON "XpEntry"("userId", "sourceKey");

-- CreateIndex
CREATE INDEX "LeaderboardGroup_courseId_organizationId_weekKey_idx" ON "LeaderboardGroup"("courseId", "organizationId", "weekKey");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardMember_userId_courseId_weekKey_key" ON "LeaderboardMember"("userId", "courseId", "weekKey");

-- AddForeignKey
ALTER TABLE "XpEntry" ADD CONSTRAINT "XpEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEntry" ADD CONSTRAINT "XpEntry_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakFreezeDay" ADD CONSTRAINT "StreakFreezeDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardGroup" ADD CONSTRAINT "LeaderboardGroup_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardMember" ADD CONSTRAINT "LeaderboardMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "LeaderboardGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardMember" ADD CONSTRAINT "LeaderboardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
