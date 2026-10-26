-- CreateTable
CREATE TABLE "EngagementEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "courseId" TEXT,
    "chapterId" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "platform" TEXT NOT NULL,
    "dedupeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EngagementEvent_userId_createdAt_idx" ON "EngagementEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EngagementEvent_type_createdAt_idx" ON "EngagementEvent"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementEvent_userId_dedupeKey_key" ON "EngagementEvent"("userId", "dedupeKey");

-- AddForeignKey
ALTER TABLE "EngagementEvent" ADD CONSTRAINT "EngagementEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
