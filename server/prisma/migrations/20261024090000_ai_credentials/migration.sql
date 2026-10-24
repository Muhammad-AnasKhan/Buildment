-- A learner's own AI provider key, stored only as AES-256-GCM ciphertext.
-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('OPENROUTER');

-- CreateTable
CREATE TABLE "AiCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL DEFAULT 'OPENROUTER',
    "ciphertext" TEXT NOT NULL,
    "iv" VARCHAR(32) NOT NULL,
    "authTag" VARCHAR(32) NOT NULL,
    "lastFour" VARCHAR(4) NOT NULL,
    "model" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "AiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiCredential_userId_key" ON "AiCredential"("userId");

-- AddForeignKey
ALTER TABLE "AiCredential" ADD CONSTRAINT "AiCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
