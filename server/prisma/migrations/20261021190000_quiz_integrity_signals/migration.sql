-- CreateEnum
CREATE TYPE "IntegrityEventType" AS ENUM ('TAB_HIDDEN', 'WINDOW_BLUR', 'FULLSCREEN_EXIT', 'COPY_BLOCKED', 'PASTE_BLOCKED', 'CONTEXT_MENU_BLOCKED', 'SCREENSHOT_KEY', 'MOUSE_LEFT', 'SECOND_SCREEN', 'FAST_ANSWER', 'CAMERA_OFF', 'CAMERA_ON');

-- CreateEnum
CREATE TYPE "IntegrityCameraStatus" AS ENUM ('NOT_REQUESTED', 'ON', 'DECLINED', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "integritySnapshots" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "IntegrityAttempt" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "cameraStatus" "IntegrityCameraStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "droppedEvents" INTEGER NOT NULL DEFAULT 0,
    "snapshotCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrityAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrityEvent" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "clientId" VARCHAR(40) NOT NULL,
    "type" "IntegrityEventType" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "blockId" TEXT,
    "meta" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegritySnapshot" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "IntegritySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegrityAttempt_chapterId_idx" ON "IntegrityAttempt"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrityAttempt_enrollmentId_chapterId_attempt_key" ON "IntegrityAttempt"("enrollmentId", "chapterId", "attempt");

-- CreateIndex
CREATE INDEX "IntegrityEvent_attemptId_at_idx" ON "IntegrityEvent"("attemptId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrityEvent_attemptId_clientId_key" ON "IntegrityEvent"("attemptId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegritySnapshot_storageKey_key" ON "IntegritySnapshot"("storageKey");

-- CreateIndex
CREATE INDEX "IntegritySnapshot_attemptId_takenAt_idx" ON "IntegritySnapshot"("attemptId", "takenAt");

-- CreateIndex
CREATE INDEX "IntegritySnapshot_deletedAt_takenAt_idx" ON "IntegritySnapshot"("deletedAt", "takenAt");

-- AddForeignKey
ALTER TABLE "IntegrityAttempt" ADD CONSTRAINT "IntegrityAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityAttempt" ADD CONSTRAINT "IntegrityAttempt_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityEvent" ADD CONSTRAINT "IntegrityEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "IntegrityAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegritySnapshot" ADD CONSTRAINT "IntegritySnapshot_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "IntegrityAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
