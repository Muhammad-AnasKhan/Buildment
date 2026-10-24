-- AI interview block: the block type, and one row per interview run.
-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'AI_INTERVIEW';

-- CreateEnum
CREATE TYPE "AiInterviewStatus" AS ENUM ('ACTIVE', 'FINISHED', 'ABANDONED');

-- CreateTable
CREATE TABLE "AiInterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "status" "AiInterviewStatus" NOT NULL DEFAULT 'ACTIVE',
    "context" TEXT,
    "transcript" JSONB NOT NULL DEFAULT '[]',
    "feedback" JSONB,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "model" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AiInterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiInterviewSession_userId_blockId_status_idx" ON "AiInterviewSession"("userId", "blockId", "status");

-- CreateIndex
CREATE INDEX "AiInterviewSession_blockId_idx" ON "AiInterviewSession"("blockId");

-- AddForeignKey
ALTER TABLE "AiInterviewSession" ADD CONSTRAINT "AiInterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInterviewSession" ADD CONSTRAINT "AiInterviewSession_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
