/**
 * Compile every imported chapter the same way the reader does, from source
 * files, with no database required. Run: pnpm content:validate:source [--course <slug>]
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import { collectCanvasProblems } from "../src/shared/mdx/canvas-tags.js";
import { collectDiagramProblems } from "../src/shared/mdx/diagram-fences.js";
import { isActivityOnlySource } from "../src/shared/mdx/extract-block-config.js";
import { collectUnknownComponents } from "../src/shared/mdx/extract.js";
import { mdxComponentAllowlist } from "../src/shared/mdx/component-allowlist.js";
import { remarkChecklist } from "../src/shared/mdx/remark-checklist.js";
import { remarkLearningLog } from "../src/shared/mdx/remark-learning-log.js";
import { remarkMermaid } from "../src/shared/mdx/remark-mermaid.js";
import { remarkDiagram } from "../src/shared/mdx/remark-diagram.js";
import { restoreInteractiveBlockTags } from "../src/shared/mdx/restore-block-tags.js";
import { collectContentTokenProblems, tokenInFieldProblem } from "../src/shared/lib/content-tokens.js";
import { secretFieldsWithTokens } from "../src/utils/sanitize-block-config.js";
import { COURSE_SLUG, loadCourseManifest } from "./course-source.js";
import { parseLesson, readLessonFiles, readModuleDirs } from "./import-course.js";


export type ChapterMdxFailure = { file: string; error: string };

export function validateParsedLesson(lesson: ReturnType<typeof parseLesson>): void {
  const processor = unified().use(remarkParse).use(remarkMdx).use(remarkGfm)
    .use(remarkChecklist).use(remarkLearningLog).use(remarkMermaid).use(remarkDiagram);
  const source = restoreInteractiveBlockTags(lesson.source);
  if (lesson.readerMode === "QUIZ" && !isActivityOnlySource(source)) {
    throw new Error("Quiz flow supports activities only: Quiz, OpenQuestion, Predict, and CodeExercise.");
  }
  const unknown = collectUnknownComponents(source, mdxComponentAllowlist);
  if (unknown.length) throw new Error(`Unknown components: ${unknown.join(", ")}`);
  const canvasProblems = collectCanvasProblems(source);
  if (canvasProblems.length) throw new Error(canvasProblems.join(" "));
  const diagramProblems = collectDiagramProblems(source);
  if (diagramProblems.length) throw new Error(diagramProblems.join(" "));
  const tokenProblems = [
    tokenInFieldProblem("chapter title", lesson.title), tokenInFieldProblem("chapter summary", lesson.summary),
    ...collectContentTokenProblems(source),
    ...lesson.blocks.flatMap(block => secretFieldsWithTokens(block.config).map(field => `Block "${block.id}" uses a placeholder in "${field}".`)),
  ].filter((problem): problem is string => problem !== null);
  if (tokenProblems.length) throw new Error(tokenProblems.join(" "));
  processor.runSync(processor.parse(source));
}

/** Transform every source lesson and compile it. Empty list means the course is safe to import. */
export function findBrokenChapters(): { total: number; failed: ChapterMdxFailure[] } {
  const failed: ChapterMdxFailure[] = [];
  let total = 0;

  try {
    const manifest = loadCourseManifest();
    const fieldProblems = manifest
      ? [
          tokenInFieldProblem("course title", manifest.title),
          tokenInFieldProblem("course description", manifest.description),
          tokenInFieldProblem("course project goal", manifest.projectGoal),
          ...manifest.modules.map((mod) => tokenInFieldProblem(`module title for ${mod.dir}`, mod.title)),
          ...(manifest.variants ?? []).flatMap(variant => variant.modules.map(mod =>
            tokenInFieldProblem(`module title for ${variant.slug}/${mod.dir}`, mod.title))),
        ]
      : [];
    for (const problem of fieldProblems) if (problem) failed.push({ file: "course.yaml", error: problem });
  } catch (err) {
    failed.push({ file: "course.yaml", error: err instanceof Error ? err.message : String(err) });
  }

  for (const { dirName, moduleNum } of readModuleDirs()) {
    for (const { fileName, lessonNum, slugPart } of readLessonFiles(dirName)) {
      total += 1;
      const file = `${dirName}/${fileName}`;
      try {
        const lesson = parseLesson(moduleNum, dirName, fileName, lessonNum, slugPart);
        validateParsedLesson(lesson);
      } catch (err) {
        const message = err instanceof Error ? err.message.split("\n")[0] : String(err);
        failed.push({ file, error: message });
      }
    }
  }

  try {
    const manifest = loadCourseManifest();
    const files = new Set<string>();
    for (const variant of manifest?.variants ?? []) {
      for (const override of variant.overrides) if (override.file) files.add(override.file);
      for (const module of variant.modules) for (const lesson of module.lessons) {
        files.add(`variants/${variant.slug}/${module.dir}/${lesson.file}`);
      }
    }
    for (const file of files) {
      total += 1;
      try {
        const moduleDir = path.dirname(file);
        const fileName = path.basename(file);
        const match = fileName.match(/^(\d+)\.(\d+)-([a-z0-9-]+)\.md$/)!;
        const lesson = parseLesson(Number(match[1]), moduleDir, fileName, Number(match[2]), match[3]);
        validateParsedLesson(lesson);
      } catch (err) {
        failed.push({ file, error: err instanceof Error ? err.message.split("\n")[0] : String(err) });
      }
    }
    for (const variant of manifest?.variants ?? []) for (const override of variant.overrides) if (override.replacements?.length) {
      const file = `variants/${variant.slug}:${override.lessonKey}`;
      total += 1;
      try {
        const module = manifest!.modules.find(item => item.lessons.some(lesson => lesson.key === override.lessonKey));
        const planned = module?.lessons.find(lesson => lesson.key === override.lessonKey);
        if (!module || !planned) throw new Error("Shared lesson key not found");
        const match = planned.file.match(/^(\d+)\.(\d+)-([a-z0-9-]+)\.md$/)!;
        const parsed = parseLesson(Number(match[1]), module.dir, planned.file, Number(match[2]), match[3]);
        let source = parsed.source;
        for (const replacement of override.replacements) {
          const first = source.indexOf(replacement.from);
          if (first < 0 || source.indexOf(replacement.from, first + replacement.from.length) >= 0) {
            throw new Error("Text replacement must match exactly once in the transformed shared lesson");
          }
          source = source.slice(0, first) + replacement.to + source.slice(first + replacement.from.length);
        }
        validateParsedLesson({ ...parsed, source });
      } catch (err) {
        failed.push({ file, error: err instanceof Error ? err.message.split("\n")[0] : String(err) });
      }
    }
  } catch (err) {
    failed.push({ file: "course.yaml", error: err instanceof Error ? err.message : String(err) });
  }

  return { total, failed };
}

const invokedDirectly =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const { total, failed } = findBrokenChapters();
  const chapterFailures = failed.filter((failure) => failure.file !== "course.yaml").length;
  console.log(`[${COURSE_SLUG}] Validated ${total} chapters: ${total - chapterFailures} OK, ${chapterFailures} failed`);
  for (const failure of failed) console.log(`  ${failure.file}: ${failure.error}`);
  if (failed.length > 0) process.exitCode = 1;
}
