-- CreateEnum
CREATE TYPE "HelpThreadStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "HelpThread" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "chapterId" TEXT,
    "menteeId" TEXT NOT NULL,
    "status" "HelpThreadStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "HelpThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpThread_courseId_status_updatedAt_idx" ON "HelpThread"("courseId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "HelpThread_menteeId_updatedAt_idx" ON "HelpThread"("menteeId", "updatedAt");

-- CreateIndex
CREATE INDEX "HelpThread_chapterId_menteeId_idx" ON "HelpThread"("chapterId", "menteeId");

-- CreateIndex
CREATE INDEX "HelpMessage_threadId_createdAt_idx" ON "HelpMessage"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "HelpThread" ADD CONSTRAINT "HelpThread_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpThread" ADD CONSTRAINT "HelpThread_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpThread" ADD CONSTRAINT "HelpThread_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpMessage" ADD CONSTRAINT "HelpMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "HelpThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpMessage" ADD CONSTRAINT "HelpMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
