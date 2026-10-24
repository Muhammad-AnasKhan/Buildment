import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadCourseManifest } from "../course-source.js";
import { findBrokenChapters, validateParsedLesson } from "../validate-course-source.js";
import "../audit-course-structure.js";
import { readModuleDirs, readLessonFiles, parseLesson } from "../import-course.js";

try {
  const manifest = loadCourseManifest();
  if (!manifest) throw new Error("ZIP must contain course.yaml.");
  const validation = findBrokenChapters();
  if (validation.failed.length) {
    throw new Error(validation.failed.map(f => `${f.file}: ${f.error}`).join("\n"));
  }
  if (process.exitCode) throw new Error("Course structure audit failed. Fix the errors above.");
  const modules = readModuleDirs().map(({ dirName, moduleNum }) => ({
    order: moduleNum,
    key: manifest.modules.find(m => m.dir === dirName)!.key,
    title: manifest.modules.find(m => m.dir === dirName)!.title,
    lessons: readLessonFiles(dirName).map(({ fileName, lessonNum, slugPart }) =>
      ({ ...parseLesson(moduleNum, dirName, fileName, lessonNum, slugPart),
        key: manifest.modules.find(m => m.dir === dirName)!.lessons.find(l => l.file === fileName)!.key })),
  }));
  const variants = (manifest.variants ?? []).map(variant => ({ slug: variant.slug,
    moduleOrder: variant.moduleOrder,
    omitLessonKeys: variant.omitLessonKeys,
    modules: variant.modules.map(module => {
      const moduleDir = `variants/${variant.slug}/${module.dir}`;
      const moduleNum = Number(module.dir.match(/^(\d+)-/)![1]);
      return { key: module.key, title: module.title, order: moduleNum,
        lessons: readLessonFiles(moduleDir).map(({ fileName, lessonNum, slugPart }) => ({
          ...parseLesson(moduleNum, moduleDir, fileName, lessonNum, slugPart),
          key: module.lessons.find(lesson => lesson.file === fileName)!.key,
        })) };
    }),
    overrides: variant.overrides.map(override => {
      const shared = modules.flatMap(module => module.lessons).find(lesson => lesson.key === override.lessonKey);
      if (!shared && !override.file) throw new Error(`Unknown shared lesson key: ${override.lessonKey}`);
      if (override.file) {
        const fileName = path.basename(override.file);
        const match = fileName.match(/^(\d+)\.(\d+)-(.+)\.md$/)!;
        const lesson = parseLesson(Number(match[1]), path.dirname(override.file), fileName, Number(match[2]), match[3]);
        validateParsedLesson(lesson);
        return { lessonKey: override.lessonKey, lesson };
      }
      let source = shared!.source;
      for (const replacement of override.replacements ?? []) {
        const first = source.indexOf(replacement.from);
        if (first < 0 || source.indexOf(replacement.from, first + replacement.from.length) >= 0) {
          throw new Error(`Text replacement for ${override.lessonKey} must match exactly once`);
        }
        source = source.slice(0, first) + replacement.to + source.slice(first + replacement.from.length);
      }
      const lesson = { ...shared!, source };
      validateParsedLesson(lesson);
      return { lessonKey: override.lessonKey, lesson };
    }),
  }));
  writeFileSync(process.env.COURSE_IMPORT_RESULT!, JSON.stringify({ manifest, modules, variants, remove: manifest.remove }));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
