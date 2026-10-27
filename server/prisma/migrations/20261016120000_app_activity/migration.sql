-- CreateTable
CREATE TABLE "AppActivityDay" (
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "heartbeats" INTEGER NOT NULL DEFAULT 0,
    "firstActiveAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppActivityDay_pkey" PRIMARY KEY ("userId","date")
);

-- CreateTable
CREATE TABLE "UserAppActivity" (
    "userId" TEXT NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,
    "lastBeatId" TEXT,

    CONSTRAINT "UserAppActivity_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "AppActivityDay_date_idx" ON "AppActivityDay"("date");

-- CreateIndex
CREATE INDEX "UserAppActivity_lastActiveAt_idx" ON "UserAppActivity"("lastActiveAt");

-- AddForeignKey
ALTER TABLE "AppActivityDay" ADD CONSTRAINT "AppActivityDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAppActivity" ADD CONSTRAINT "UserAppActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

