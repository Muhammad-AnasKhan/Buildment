CREATE TYPE "VariantAssignment" AS ENUM ('SELF_SELECT', 'RANDOM');
ALTER TABLE "Course" ADD COLUMN "variantAssignment" "VariantAssignment" NOT NULL DEFAULT 'SELF_SELECT';
ALTER TABLE "Enrollment" ADD COLUMN "variantAssignedAt" TIMESTAMP(3);
