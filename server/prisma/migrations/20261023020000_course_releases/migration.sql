CREATE TABLE "CourseRelease" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "sourceHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseRelease_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Course" ADD COLUMN "activeReleaseId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "releaseId" TEXT;

CREATE UNIQUE INDEX "CourseRelease_courseId_number_key" ON "CourseRelease"("courseId", "number");
CREATE UNIQUE INDEX "CourseRelease_courseId_sourceHash_key" ON "CourseRelease"("courseId", "sourceHash");
CREATE INDEX "Enrollment_releaseId_idx" ON "Enrollment"("releaseId");

ALTER TABLE "CourseRelease" ADD CONSTRAINT "CourseRelease_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "CourseRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;
