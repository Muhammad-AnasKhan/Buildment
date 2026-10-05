-- AlterTable
ALTER TABLE "Review" ADD COLUMN "seenAt" TIMESTAMP(3);
ALTER TABLE "HelpThread" ADD COLUMN "menteeLastReadAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "HeadingNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "headingId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeadingNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeadingNote_userId_chapterId_headingId_key" ON "HeadingNote"("userId", "chapterId", "headingId");
CREATE INDEX "HeadingNote_chapterId_idx" ON "HeadingNote"("chapterId");

-- AddForeignKey
ALTER TABLE "HeadingNote" ADD CONSTRAINT "HeadingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HeadingNote" ADD CONSTRAINT "HeadingNote_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
