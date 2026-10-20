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
import { collectUnknownComponents } from "../src/shared/mdx/extract.js";
import { remarkChecklist } from "../src/shared/mdx/remark-checklist.js";
import { remarkLearningLog } from "../src/shared/mdx/remark-learning-log.js";
import { remarkMermaid } from "../src/shared/mdx/remark-mermaid.js";
import { restoreInteractiveBlockTags } from "../src/shared/mdx/restore-block-tags.js";
import { COURSE_SLUG, loadCourseManifest } from "./course-source.js";
import { parseLesson, readLessonFiles, readModuleDirs } from "./import-course.js";

const componentNames = [
  "Quiz",
  "Predict",
  "OpenQuestion",
  "CodeExercise",
  "Steps",
  "ProjectPreview",
  "LearningObjectives",
  "ChapterRecap",
  "Checklist",
  "LearningLog",
  "VideoBlock",
  "VisualWalkthrough",
  "VisualDiagram",
  "Roadmap",
  "MermaidDiagram",
  "Callout",
  "FaqGroup",
  "FaqItem",
  "CheckpointIntro",
  "MustRead",
  "BigWordAlert",
  "InterestingRead",
  "RealWorldEvent",
  "ApiRequestPanel",
  "ApiRequest",
  "ComparePanel",
  "CompareColumn",
  "FileTree",
  "FileTreeItem",
  "TerminalBlock",
  "TerminalLine",
  "DiffBlock",
  "ArchitectureDiagram",
  "ArchNode",
  "StateMachine",
  "EntityDiagram",
  "TraceRequest",
  "TraceStep",
] as const;

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
  const allowed = new Set<string>(componentNames);

  try {
    loadCourseManifest();
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
        const unknown = collectUnknownComponents(source, allowed);
        if (unknown.length > 0) {
          throw new Error(`Unknown components: ${unknown.join(", ")}`);
        }
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
