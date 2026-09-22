/**
 * Structural audit for content/import/multi-vendor-marketplace/.
 * Run: pnpm content:audit
 * Exit 1 if demo modules (01–03) have errors; warnings only elsewhere unless --strict.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

function auditModule(moduleNum: number, dirName: string): Issue[] {
  const issues: Issue[] = [];
  const modulePath = path.join(COURSE_DIR, dirName);
  const files = readLessonFiles(dirName).map((f) => f.fileName);
  const fileSet = new Set(files);

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
