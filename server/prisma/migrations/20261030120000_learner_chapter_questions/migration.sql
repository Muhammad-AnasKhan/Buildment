-- CreateTable
CREATE TABLE "LearnerQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearnerQuestion_createdAt_idx" ON "LearnerQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "LearnerQuestion_userId_createdAt_idx" ON "LearnerQuestion"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "LearnerQuestion" ADD CONSTRAINT "LearnerQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

