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
import { isActivityOnlySource } from "../src/shared/mdx/extract-block-config.js";
import { collectUnknownComponents } from "../src/shared/mdx/extract.js";
import { mdxComponentAllowlist } from "../src/shared/mdx/component-allowlist.js";
import { remarkChecklist } from "../src/shared/mdx/remark-checklist.js";
import { remarkLearningLog } from "../src/shared/mdx/remark-learning-log.js";
import { remarkMermaid } from "../src/shared/mdx/remark-mermaid.js";
import { restoreInteractiveBlockTags } from "../src/shared/mdx/restore-block-tags.js";
import { collectContentTokenProblems, tokenInFieldProblem } from "../src/shared/lib/content-tokens.js";
import { secretFieldsWithTokens } from "../src/utils/sanitize-block-config.js";
import { COURSE_SLUG, loadCourseManifest } from "./course-source.js";
import { parseLesson, readLessonFiles, readModuleDirs } from "./import-course.js";


export type ChapterMdxFailure = { file: string; error: string };

/** Transform every source lesson and compile it. Empty list means the course is safe to import. */
export function findBrokenChapters(): { total: number; failed: ChapterMdxFailure[] } {
  const failed: ChapterMdxFailure[] = [];
  let total = 0;
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkChecklist)
    .use(remarkLearningLog)
    .use(remarkMermaid);
  // Same list the API checks at publish time, so source validation never
  // rejects a component the reader renders (GlossaryTerm, Step) or allows one it refuses.
  const allowed = mdxComponentAllowlist;

  try {
    const manifest = loadCourseManifest();
    const fieldProblems = manifest
      ? [
          tokenInFieldProblem("course title", manifest.title),
          tokenInFieldProblem("course description", manifest.description),
          tokenInFieldProblem("course project goal", manifest.projectGoal),
          ...manifest.modules.map((mod) => tokenInFieldProblem(`module title for ${mod.dir}`, mod.title)),
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
        const source = restoreInteractiveBlockTags(lesson.source);
        if (lesson.readerMode === "QUIZ" && !isActivityOnlySource(source)) {
          throw new Error("Quiz flow supports activities only: Quiz, OpenQuestion, Predict, and CodeExercise. Move lesson text, headings, recaps, checklists, learning logs, and visual blocks to a standard lesson. Put activity instructions in the activity prompt.");
        }
        const unknown = collectUnknownComponents(source, allowed);
        if (unknown.length > 0) {
          throw new Error(`Unknown components: ${unknown.join(", ")}`);
        }
        const canvasProblems = collectCanvasProblems(source);
        if (canvasProblems.length > 0) throw new Error(canvasProblems.join(" "));
        const tokenProblems = [
          tokenInFieldProblem("chapter title", lesson.title),
          tokenInFieldProblem("chapter summary", lesson.summary),
          ...collectContentTokenProblems(source),
          ...lesson.blocks.flatMap((block) => secretFieldsWithTokens(block.config).map((field) => `Block "${block.id}" uses a placeholder in "${field}". Answer keys, rubrics, tests and solutions must be the same for every learner.`)),
        ].filter((problem): problem is string => problem !== null);
        if (tokenProblems.length > 0) throw new Error(tokenProblems.join(" "));
        processor.runSync(processor.parse(source));
      } catch (err) {
        const message = err instanceof Error ? err.message.split("\n")[0] : String(err);
        failed.push({ file, error: message });
      }
    }
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
