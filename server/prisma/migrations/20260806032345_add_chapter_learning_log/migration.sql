-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BlockType" ADD VALUE 'STEPS';
ALTER TYPE "BlockType" ADD VALUE 'PROJECT_PREVIEW';
ALTER TYPE "BlockType" ADD VALUE 'LEARNING_OBJECTIVES';
ALTER TYPE "BlockType" ADD VALUE 'CHAPTER_RECAP';

-- AlterTable
ALTER TABLE "ChapterProgress" ADD COLUMN     "learningLog" JSONB;
