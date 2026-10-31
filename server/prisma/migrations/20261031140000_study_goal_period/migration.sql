-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('DAILY', 'WEEKLY');

-- AlterEnum
ALTER TYPE "WeeklyGoalKind" ADD VALUE 'MINUTES';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "goalPeriod" "GoalPeriod";

-- Backfill: existing goals were always weekly.
UPDATE "User"
SET "goalPeriod" = 'WEEKLY'
WHERE "weeklyGoalKind" IS NOT NULL AND "weeklyGoalTarget" IS NOT NULL AND "goalPeriod" IS NULL;
