/**
 * Structural audit for content/import/multi-vendor-marketplace/.
 * Run: pnpm content:audit
 * Exit 1 if demo modules (01–03) have errors; warnings only elsewhere unless --strict.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import { readLessonFiles, readModuleDirs } from "./import-course";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSE_DIR = path.resolve(__dirname, "../content/import/multi-vendor-marketplace");

const DEMO_MODULES = new Set([1, 2, 3]);
const SKIP_DIRS = new Set(["scripts"]);

type Issue = { level: "error" | "warn"; module: number; file?: string; message: string };

function readBody(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
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
    } catch {
      issues.push({
        level: "error",
        module: moduleNum,
        file: fileName,
        message: "Quiz fence contains invalid YAML",
      });
    }
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
      level: moduleNum <= 3 ? "error" : "warn",
      module: moduleNum,
      message: "Missing set-the-scene lesson",
    });
  }

  const checklist = files.find((f) => f.endsWith("-checklist.md"));
  if (!checklist && moduleNum !== 99 && moduleNum !== 1) {
    issues.push({
      level: "error",
      module: moduleNum,
      message: "Missing gate checklist file (*-checklist.md)",
    });
  }
  if (moduleNum === 1 && !files.some((f) => f.match(/01\.11-checklist\.md$/))) {
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
        level: moduleNum <= 3 ? "error" : "warn",
        module: moduleNum,
        file: checklist,
        message: "Gate checklist missing ## Learning log section",
      });
    }
    const numbered = body.match(/^\d+\.\s+/gm);
    if (!numbered || numbered.length < 3) {
      issues.push({
        level: moduleNum <= 3 ? "error" : "warn",
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

function main() {
  const strict = process.argv.includes("--strict");
  const all: Issue[] = [];

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
    `\nAudit complete: ${errors.length} error(s), ${warns.length} warning(s) across ${readModuleDirs().length} module dirs.`
  );

  const demoErrors = errors.filter((e) => DEMO_MODULES.has(e.module));
  if (demoErrors.length > 0) {
    process.exitCode = 1;
  } else if (strict && errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
