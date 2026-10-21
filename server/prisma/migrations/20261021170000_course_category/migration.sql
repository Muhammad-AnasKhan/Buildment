-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('TECH', 'SOFT_SKILLS');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "category" "CourseCategory" NOT NULL DEFAULT 'TECH';
