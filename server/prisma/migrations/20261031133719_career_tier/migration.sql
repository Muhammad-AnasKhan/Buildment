-- CreateEnum
CREATE TYPE "CareerTier" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "careerTier" "CareerTier" NOT NULL DEFAULT 'INTERN';
