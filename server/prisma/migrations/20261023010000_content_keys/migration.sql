ALTER TABLE "Module" ADD COLUMN "contentKey" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "contentKey" TEXT;

CREATE UNIQUE INDEX "Module_courseId_contentKey_key" ON "Module"("courseId", "contentKey");
CREATE UNIQUE INDEX "Chapter_courseId_contentKey_key" ON "Chapter"("courseId", "contentKey");
