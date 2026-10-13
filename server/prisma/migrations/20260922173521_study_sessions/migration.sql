-- CreateEnum
CREATE TYPE "StudySessionStatus" AS ENUM ('RUNNING', 'PAUSED', 'ENDED');

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "status" "StudySessionStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudySession_enrollmentId_startedAt_idx" ON "StudySession"("enrollmentId", "startedAt");

-- CreateIndex
CREATE INDEX "StudySession_enrollmentId_status_idx" ON "StudySession"("enrollmentId", "status");

-- CreateIndex
CREATE INDEX "StudySession_chapterId_idx" ON "StudySession"("chapterId");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
