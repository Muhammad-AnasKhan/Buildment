CREATE TABLE "CourseChapterDraft" (
    "chapterId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "baseReleaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "estimatedMinutes" INTEGER,
    "readerMode" "ChapterReaderMode" NOT NULL,
    "isMilestone" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CourseChapterDraft_pkey" PRIMARY KEY ("chapterId")
);
CREATE INDEX "CourseChapterDraft_courseId_idx" ON "CourseChapterDraft"("courseId");
ALTER TABLE "CourseChapterDraft" ADD CONSTRAINT "CourseChapterDraft_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseChapterDraft" ADD CONSTRAINT "CourseChapterDraft_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
