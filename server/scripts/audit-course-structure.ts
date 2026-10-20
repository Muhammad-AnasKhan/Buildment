/**
 * Structural audit for one course folder under content/import/.
 * Run: pnpm content:audit [--course <slug>] [--strict]
 * FreshMarket: exit 1 if demo modules (01-03) have errors; warnings only elsewhere unless --strict.
 * Courses with a course.yaml: every module is held to the demo-module bar, and the lesson files
 * must match the plan in course.yaml.
 */
import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { COURSE_SLUG, COURSE_SOURCE_DIR as COURSE_DIR, loadCourseManifest, type CourseManifest } from "./course-source.js";
import { readLessonFiles, readModuleDirs } from "./import-course.js";

const manifest = loadCourseManifest();
const DEMO_MODULES = new Set([1, 2, 3]);

/** Modules whose structural problems are errors rather than warnings. */
function isStrictModule(moduleNum: number): boolean {
  return manifest !== null || DEMO_MODULES.has(moduleNum);
}
const SKIP_DIRS = new Set(["scripts"]);

type Issue = { level: "error" | "warn"; module: number; file?: string; message: string };

function readBody(filePath: string): string {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function frontmatterStepType(body: string): string | null {
  const m = body.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const step = m[1]!.match(/^stepType:\s*"?([^"\n]+)"?/m);
  return step?.[1]?.trim() ?? null;
}

function lessonCount(moduleDir: string): number {
  return readLessonFiles(moduleDir).length;
}

function auditInteractiveFences(moduleNum: number, fileName: string, body: string): Issue[] {
  const issues: Issue[] = [];
  const predictFences = [...body.matchAll(/```predict\n([\s\S]*?)```/g)];
  const quizFences = [...body.matchAll(/```quiz\n([\s\S]*?)```/g)];
  let predictCount = 0;
  let predictLongestCorrect = 0;
  let mcqCount = 0;
  let mcqLongestCorrect = 0;

  /**
   * Option length is a common test-wiseness leak: if the correct option is the
   * longest, a learner can pass without understanding the concept. "leaks"
   * requires a meaningful margin; "isLongest" feeds the set-level check so a
   * small but repeated bias is still caught.
   */
  function optionLengths(labels: string[], correctIndex: number) {
    const correctLength = labels[correctIndex]?.trim().length ?? 0;
    const wrongLengths = labels
      .filter((_, index) => index !== correctIndex)
      .map((label) => label.trim().length);
    const longestWrong = wrongLengths.length > 0 ? Math.max(...wrongLengths) : 0;
    return {
      correctLength,
      isLongest: correctLength > longestWrong,
      leaks: correctLength > longestWrong && correctLength >= longestWrong * 1.1,
    };
  }

  if (/quiz (?:is )?reserved|quiz placeholder|reserved\s+—\s+excluded/i.test(body)) {
    issues.push({
      level: "error",
      module: moduleNum,
      file: fileName,
      message: "Lesson still describes a quiz as reserved, excluded, or a placeholder",
    });
  }

  for (const [, rawConfig] of predictFences) {
    try {
      const config = loadYaml(rawConfig) as {
        prompt?: unknown;
        options?: Array<{ id?: unknown; label?: unknown }>;
        correctOptionId?: unknown;
      } | null;
      const prompt = typeof config?.prompt === "string" ? config.prompt.trim() : "";
      const options = Array.isArray(config?.options) ? config.options : [];
      const correctOptionId =
        typeof config?.correctOptionId === "string" ? config.correctOptionId : "";
      const optionIds = options
        .map((option) => (typeof option?.id === "string" ? option.id : ""))
        .filter(Boolean);

      if (!prompt || options.length !== 2 || !correctOptionId || !optionIds.includes(correctOptionId)) {
        issues.push({
          level: "error",
          module: moduleNum,
          file: fileName,
          message:
            "Predict must have a prompt, exactly two options, and a correctOptionId matching an option",
        });
      }

      const correctIndex = options.findIndex((option) => option.id === correctOptionId);
      if (correctIndex >= 0) {
        const lengths = optionLengths(
          options.map((option) => (typeof option.label === "string" ? option.label : "")),
          correctIndex
        );
        if (lengths.correctLength > 0) {
          predictCount += 1;
          if (lengths.isLongest) predictLongestCorrect += 1;
          if (lengths.leaks) {
            issues.push({
              level: "warn",
              module: moduleNum,
              file: fileName,
              message:
                "Correct prediction option is the longest — write both options at a comparable length so length cannot reveal the answer",
            });
          }
        }
      }

      if (/single riskiest assumption in this module/i.test(prompt)) {
        issues.push({
          level: "error",
          module: moduleNum,
          file: fileName,
          message: "Predict uses the duplicated generic risk prompt — write a module-specific decision",
        });
      }
    } catch {
      issues.push({
        level: "error",
        module: moduleNum,
        file: fileName,
        message: "Predict fence contains invalid YAML",
      });
    }
  }

  for (const [, rawConfig] of quizFences) {
    try {
      const config = loadYaml(rawConfig) as {
        type?: unknown;
        question?: unknown;
        options?: unknown[];
        correct?: unknown;
        explanations?: unknown;
        modelAnswer?: unknown;
      } | null;
      const validQuestion = typeof config?.question === "string" && config.question.trim().length > 0;
      const validMcq =
        config?.type === "mcq" &&
        Array.isArray(config.options) &&
        config.options.length >= 2 &&
        typeof config.correct === "number" &&
        Number.isInteger(config.correct) &&
        config.correct >= 0 &&
        config.correct < config.options.length;
      const validShort =
        config?.type === "short" &&
        typeof config.modelAnswer === "string" &&
        config.modelAnswer.trim().length > 0;
      if (!validQuestion || (!validMcq && !validShort)) {
        issues.push({
          level: "error",
          module: moduleNum,
          file: fileName,
          message: "Quiz fence must be a valid mcq or short question supported by the importer",
        });
      }
      const explainsEveryOption =
        Array.isArray(config?.explanations) &&
        Array.isArray(config?.options) &&
        config.explanations.length === config.options.length &&
        config.explanations.every((why) => typeof why === "string" && why.trim().length > 0);
      if (validMcq) {
        const labels = (config.options as unknown[]).map((option) => String(option));
        const lengths = optionLengths(labels, config.correct as number);
        if (lengths.correctLength > 0) {
          mcqCount += 1;
          if (lengths.isLongest) mcqLongestCorrect += 1;
          if (lengths.leaks) {
            issues.push({
              level: "warn",
              module: moduleNum,
              file: fileName,
              message:
                "Correct quiz option is the longest — write distractors at a comparable length so length cannot reveal the answer",
            });
          }
        }
      }
      if (manifest !== null && validMcq && !explainsEveryOption) {
        issues.push({
          level: "error",
          module: moduleNum,
          file: fileName,
          message: "Multiple-choice quiz needs an explanations list with one reason per option",
        });
      }
    } catch {
      issues.push({
        level: "error",
        module: moduleNum,
        file: fileName,
        message: "Quiz fence contains invalid YAML",
      });
    }
  }

  if (mcqCount >= 3 && mcqLongestCorrect / mcqCount >= 0.5) {
    issues.push({
      level: "warn",
      module: moduleNum,
      file: fileName,
      message: `Correct quiz option is the longest in ${mcqLongestCorrect}/${mcqCount} questions — the set leaks the answer by length`,
    });
  }

  if (predictCount >= 2 && predictLongestCorrect / predictCount >= 0.5) {
    issues.push({
      level: "warn",
      module: moduleNum,
      file: fileName,
      message: `Correct prediction option is the longest in ${predictLongestCorrect}/${predictCount} prompts — the set leaks the answer by length`,
    });
  }

  if (fileName.endsWith("-quiz.md")) {
    const quizFenceCount = quizFences.length;
    if (quizFenceCount === 0) {
      issues.push({
        level: "error",
        module: moduleNum,
        file: fileName,
        message: "Quiz chapter has no authored quiz blocks",
      });
    }
    if (/skip (?:it|to)/i.test(body)) {
      issues.push({
        level: "error",
        module: moduleNum,
        file: fileName,
        message: "Quiz chapter still contains reserved, placeholder, or skip copy",
      });
    }
    if (predictFences.length > 0) {
      issues.push({
        level: "error",
        module: moduleNum,
        file: fileName,
        message: "Predict blocks belong inline in lessons, not inside quiz chapters",
      });
    }
  }

  return issues;
}

function auditModule(moduleNum: number, dirName: string): Issue[] {
  const issues: Issue[] = [];
  const modulePath = path.join(COURSE_DIR, dirName);
  const files = readLessonFiles(dirName).map((f) => f.fileName);

  const setScene = files.find(
    (f) =>
      f.includes("set-the-scene") ||
      (moduleNum === 1 && /01\.01-/.test(f)) ||
      (moduleNum === 99 && f.includes("99.01"))
  );
  if (!setScene && moduleNum !== 99) {
    issues.push({
      level: isStrictModule(moduleNum) ? "error" : "warn",
      module: moduleNum,
      message: "Missing set-the-scene lesson",
    });
  }

  const checklist = files.find((f) => f.endsWith("-checklist.md"));
  if (!checklist && moduleNum !== 99 && (manifest !== null || moduleNum !== 1)) {
    issues.push({
      level: "error",
      module: moduleNum,
      message: "Missing gate checklist file (*-checklist.md)",
    });
  }
  if (manifest === null && moduleNum === 1 && !files.some((f) => f.match(/01\.11-checklist\.md$/))) {
    issues.push({
      level: "error",
      module: 1,
      message: "Module 01 should include 01.11-checklist.md (introduction gate)",
    });
  }

  const hasRecap = files.some((f) => f.includes("recap-and-whats-next"));
  const lastLesson = files
    .filter((f) => f.endsWith(".md"))
    .sort()
    .at(-1);
  if (!hasRecap && lastLesson && !lastLesson.includes("checklist") && moduleNum !== 99) {
    issues.push({
      level: "warn",
      module: moduleNum,
      message: "No dedicated recap-and-whats-next lesson (last lesson may still recap)",
    });
  }

  const quiz = files.find((f) => f.endsWith("-quiz.md"));
  const count = lessonCount(dirName);
  if (!quiz && count >= 8 && moduleNum !== 99 && moduleNum !== 1) {
    issues.push({
      level: "warn",
      module: moduleNum,
      message: `No mid-module quiz but ${count} lessons — consider *-quiz.md`,
    });
  }

  if (checklist && !checklist.includes("production-env-checklist")) {
    const body = readBody(path.join(modulePath, checklist));
    if (!/## Learning log/i.test(body)) {
      issues.push({
        level: isStrictModule(moduleNum) ? "error" : "warn",
        module: moduleNum,
        file: checklist,
        message: "Gate checklist missing ## Learning log section",
      });
    }
    const numbered = body.match(/^\d+\.\s+/gm);
    if (!numbered || numbered.length < 3) {
      issues.push({
        level: isStrictModule(moduleNum) ? "error" : "warn",
        module: moduleNum,
        file: checklist,
        message: "Gate learning log should have at least 3 numbered questions",
      });
    }
    const stepType = frontmatterStepType(body);
    if (stepType !== "Gate") {
      issues.push({
        level: "warn",
        module: moduleNum,
        file: checklist,
        message: `Checklist frontmatter stepType is "${stepType ?? "missing"}", expected Gate`,
      });
    }
  }

  for (const fileName of files) {
    const body = readBody(path.join(modulePath, fileName));
    issues.push(...auditInteractiveFences(moduleNum, fileName, body));
    const stepType = frontmatterStepType(body);
    if (fileName.endsWith("-checklist.md") && stepType !== "Gate") {
      issues.push({
        level: "warn",
        module: moduleNum,
        file: fileName,
        message: "Filename suggests gate but stepType is not Gate",
      });
    }
    if (fileName.endsWith("-quiz.md") && stepType && stepType !== "Check") {
      issues.push({
        level: "warn",
        module: moduleNum,
        file: fileName,
        message: `Quiz lesson stepType "${stepType}" — expected Check`,
      });
    }

    // New courses are written for second-language readers without em or en dashes.
    if (manifest !== null && /[–—]/.test(body)) {
      issues.push({
        level: "error",
        module: moduleNum,
        file: fileName,
        message: "Contains an em or en dash; use a colon, a comma or two sentences",
      });
    }

    // Prose heuristics (warn)
    const tableCellLong = body.match(/\|[^|\n]{121,}\|/g);
    if (tableCellLong?.length) {
      issues.push({
        level: "warn",
        module: moduleNum,
        file: fileName,
        message: `${tableCellLong.length} table cell(s) exceed 120 chars — move prose above table (STYLE.md)`,
      });
    }
  }

  return issues;
}

/** Every planned module and lesson exists on disk, and nothing on disk is missing from the plan. */
function auditPlan(plan: CourseManifest): Issue[] {
  const issues: Issue[] = [];
  const moduleDirs = readModuleDirs();
  const plannedDirs = new Set(plan.modules.map((m) => m.dir));

  for (const { dirName, moduleNum } of moduleDirs) {
    if (!plannedDirs.has(dirName)) {
      issues.push({ level: "error", module: moduleNum, message: `Folder ${dirName}/ is not planned in course.yaml` });
    }
  }

  for (const planned of plan.modules) {
    const moduleNum = Number(planned.dir.match(/^(\d+)-/)![1]);
    if (!moduleDirs.some((m) => m.dirName === planned.dir)) {
      issues.push({ level: "error", module: moduleNum, message: `Planned module folder ${planned.dir}/ does not exist` });
      continue;
    }
    const onDisk = new Set(readLessonFiles(planned.dir).map((f) => f.fileName));
    const plannedFiles = new Set(planned.lessons.map((l) => l.file));
    for (const file of plannedFiles) {
      if (!onDisk.has(file)) {
        issues.push({ level: "error", module: moduleNum, file, message: "Planned lesson file does not exist" });
      }
    }
    for (const file of onDisk) {
      if (!plannedFiles.has(file)) {
        issues.push({ level: "error", module: moduleNum, file, message: "Lesson file is not planned in course.yaml" });
      }
    }
  }

  return issues;
}

function main() {
  const strict = process.argv.includes("--strict");
  const all: Issue[] = manifest ? auditPlan(manifest) : [];

  for (const { dirName, moduleNum } of readModuleDirs()) {
    if (SKIP_DIRS.has(dirName)) continue;
    all.push(...auditModule(moduleNum, dirName));
  }

  const errors = all.filter((i) => i.level === "error");
  const warns = all.filter((i) => i.level === "warn");

  for (const i of all) {
    const prefix = i.level === "error" ? "ERROR" : "WARN";
    const loc = i.file ? ` ${i.file}` : "";
    console.log(`${prefix} [module ${String(i.module).padStart(2, "0")}]${loc}: ${i.message}`);
  }

  console.log(
    `\n[${COURSE_SLUG}] Audit complete: ${errors.length} error(s), ${warns.length} warning(s) across ${readModuleDirs().length} module dirs.`
  );

  const demoErrors = errors.filter((e) => isStrictModule(e.module));
  if (demoErrors.length > 0) {
    process.exitCode = 1;
  } else if (strict && errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
