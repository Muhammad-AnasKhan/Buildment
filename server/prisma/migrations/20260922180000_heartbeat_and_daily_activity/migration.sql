-- CreateEnum
CREATE TYPE "ChapterReaderMode" AS ENUM ('DEFAULT', 'QUIZ');

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN "estimatedMinutes" INTEGER,
ADD COLUMN "readerMode" "ChapterReaderMode" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN "lastNudgeSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyActivity_enrollmentId_date_idx" ON "DailyActivity"("enrollmentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_enrollmentId_date_key" ON "DailyActivity"("enrollmentId", "date");

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
