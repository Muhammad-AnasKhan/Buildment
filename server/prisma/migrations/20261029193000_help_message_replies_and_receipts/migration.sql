-- AlterTable
ALTER TABLE "HelpMessage"
ADD COLUMN "replyToId" TEXT,
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "seenAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "HelpMessage_replyToId_idx" ON "HelpMessage"("replyToId");

-- AddForeignKey
ALTER TABLE "HelpMessage"
ADD CONSTRAINT "HelpMessage_replyToId_fkey"
FOREIGN KEY ("replyToId") REFERENCES "HelpMessage"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
