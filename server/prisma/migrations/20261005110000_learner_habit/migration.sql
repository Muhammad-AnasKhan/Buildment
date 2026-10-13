-- CreateEnum
CREATE TYPE "WeeklyGoalKind" AS ENUM ('SESSIONS', 'CHAPTERS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "weeklyGoalKind" "WeeklyGoalKind",
ADD COLUMN "weeklyGoalTarget" INTEGER,
ADD COLUMN "celebratedStreakMilestones" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
