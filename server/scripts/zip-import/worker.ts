import { writeFileSync } from "node:fs";
import { loadCourseManifest } from "../course-source.js";
import { findBrokenChapters } from "../validate-course-source.js";
import "../audit-course-structure.js";
import { readModuleDirs, readLessonFiles, parseLesson } from "../import-course.js";

try {
  const manifest = loadCourseManifest();
  if (!manifest) throw new Error("ZIP must contain course.yaml.");
  const validation = findBrokenChapters();
  if (!validation.total || validation.failed.length) {
    throw new Error(validation.failed.map(f => `${f.file}: ${f.error}`).join("\n") || "Course has no lessons.");
  }
  if (process.exitCode) throw new Error("Course structure audit failed. Fix the errors above.");
  const modules = readModuleDirs().map(({ dirName, moduleNum }) => ({
    title: manifest.modules.find(m => m.dir === dirName)!.title,
    lessons: readLessonFiles(dirName).map(({ fileName, lessonNum, slugPart }) =>
      parseLesson(moduleNum, dirName, fileName, lessonNum, slugPart)),
  }));
  writeFileSync(process.env.COURSE_IMPORT_RESULT!, JSON.stringify({ manifest, modules }));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
