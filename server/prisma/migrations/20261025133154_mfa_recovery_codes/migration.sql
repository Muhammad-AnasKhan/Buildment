-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totpRecoveryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
