-- AlterTable
ALTER TABLE "User" ADD COLUMN "testerEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "autoGradeOpenQuestions" BOOLEAN NOT NULL DEFAULT false;
