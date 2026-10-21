ALTER TABLE "Course" ADD COLUMN "familySlug" TEXT;

ALTER TABLE "Enrollment"
  ADD COLUMN "variantSlug" TEXT,
  ADD COLUMN "variantChosenAt" TIMESTAMP(3),
  ADD COLUMN "specialisationSlug" TEXT,
  ADD COLUMN "specialisationChosenAt" TIMESTAMP(3);

-- FreshMarket is the general course of the multi-vendor marketplace family:
-- the folder import uses the first slug, the production ZIP the second.
UPDATE "Course"
  SET "familySlug" = 'multi-vendor-marketplace'
  WHERE "slug" IN ('multi-vendor-marketplace', 'freshmarket-multi-vendor-marketplace-v2');
