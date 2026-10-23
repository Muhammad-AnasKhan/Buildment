ALTER TABLE "Enrollment" ADD COLUMN "variantLockedAt" TIMESTAMP(3);

-- Existing learners who have started cannot switch variants after this rollout.
UPDATE "Enrollment" AS enrollment
SET "variantLockedAt" = COALESCE(enrollment."startedAt", CURRENT_TIMESTAMP),
    "variantSlug" = COALESCE(enrollment."variantSlug", 'grocery')
FROM "Course" AS course
WHERE enrollment."courseId" = course."id"
  AND course."familySlug" = 'multi-vendor-marketplace'
  AND EXISTS (
    SELECT 1 FROM "ChapterProgress" AS progress
    WHERE progress."enrollmentId" = enrollment."id"
      AND (progress."startedAt" IS NOT NULL OR progress."status" <> 'NOT_STARTED')
  );
