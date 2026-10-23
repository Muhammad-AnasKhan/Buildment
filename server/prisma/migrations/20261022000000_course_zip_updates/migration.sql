ALTER TABLE "Module" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Chapter" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE TABLE "CourseImportPreview" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "plan" JSONB NOT NULL,
  "diff" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourseImportPreview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CourseImportPreview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CourseImportPreview_courseId_userId_idx" ON "CourseImportPreview"("courseId", "userId");
CREATE INDEX "CourseImportPreview_expiresAt_idx" ON "CourseImportPreview"("expiresAt");
