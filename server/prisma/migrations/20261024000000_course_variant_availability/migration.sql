ALTER TABLE "Course" ADD COLUMN "availableVariantSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- The live FreshMarket source has only grocery lessons. Keep historical variant
-- enrollments intact while preventing new choices from using inherited grocery work.
UPDATE "Course"
SET "familySlug" = 'multi-vendor-marketplace',
    "availableVariantSlugs" = ARRAY['grocery']::TEXT[]
WHERE "slug" IN ('freshmarket-multi-vendor-marketplace-v3', 'multi-vendor-marketplace');

UPDATE "Course"
SET "title" = 'Multi-vendor Marketplace',
    "description" = 'Build and deploy a multi-vendor marketplace through a product-specific track. Your assigned or selected track determines the data model, build steps, assessments, and capstone you see.',
    "projectGoal" = 'Ship a live marketplace with independent sellers or providers, a safe customer journey, and reliability evidence for the chosen product track.'
WHERE "slug" IN ('freshmarket-multi-vendor-marketplace-v3', 'multi-vendor-marketplace');
