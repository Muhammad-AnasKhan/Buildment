/** Report grocery-specific content in each marketplace variant's effective learner path.
 *
 * The marketplace is one shared course. A variant resolves its curriculum at
 * release time from the shared modules, the variant module order, explicit
 * omissions, full lesson files and exact text replacements. This audit must
 * therefore judge what the learner actually reads, not the raw shared file.
 *
 * A full lesson override replaces the shared lesson. A replacement-only
 * override adapts the shared lesson's text. Omitted lessons and modules are
 * not part of that variant's path. Variant-only modules are authored for the
 * variant and are scanned for leaked FreshMarket details as well.
 *
 * This is a conservative content review aid, not a substitute for reading the
 * whole path. A released variant must have zero effective findings.
 * Run: pnpm exec tsx scripts/audit-marketplace-inheritance.ts
 */
import fs from "node:fs";
import path from "node:path";
import { COURSE_SOURCE_DIR, loadCourseManifest } from "./course-source.js";
import { findCourseFamily } from "../src/shared/lib/course-tracks.js";

const manifest = loadCourseManifest();
if (!manifest || manifest.slug !== "multi-vendor-marketplace") {
  throw new Error("Run this audit against courses/multi-vendor-marketplace/course.yaml");
}
const family = findCourseFamily(manifest.family);
if (!family) throw new Error("Marketplace variant family is missing");

// Each term names a detail of the FreshMarket reference build. A flag asks a
// reviewer to confirm whether that passage can really remain shared.
// "produce" is usually a verb in engineering prose ("the job can produce a
// report"), so match only the grocery-noun uses. A bare \bproduce\b flagged
// dozens of correct sentences and buried the real findings.
const groceryDetails = /\b(?:freshmarket|grocer\w*|apples?|milk|tomatoes?|olive oil|bakery|perish\w*|kilograms?|vegetables?|fruits?)\b|\b(?:fresh\s+)?produce\s+(?:is|are|section|aisle|photos?|department|market|look)|\bthe\s+produce\b|\bbrowse\s+produce\b/i;

type Replacement = { from: string; to: string };
type VariantPlan = {
  slug: string;
  overrides?: Array<{ lessonKey: string; file?: string; replacements?: Replacement[] }>;
  omitLessonKeys?: string[];
  moduleOrder?: string[];
  modules?: Array<{ dir: string; lessons: Array<{ key: string; file: string }> }>;
};

const variants = (manifest.variants ?? []) as VariantPlan[];
let releaseProblems = 0;

function applyReplacements(source: string, replacements: Replacement[], lessonKey: string): { text: string; problems: string[] } {
  const problems: string[] = [];
  let text = source;
  for (const replacement of replacements) {
    const first = text.indexOf(replacement.from);
    if (first < 0 || text.indexOf(replacement.from, first + replacement.from.length) >= 0) {
      problems.push(`${lessonKey}: replacement does not match exactly once: ${JSON.stringify(replacement.from)}`);
      continue;
    }
    text = text.slice(0, first) + replacement.to + text.slice(first + replacement.from.length);
  }
  return { text, problems };
}

for (const variant of family.variants.filter((item) => item.slug !== family.defaultVariantSlug)) {
  const plan = variants.find((item) => item.slug === variant.slug);
  const overrides = new Map((plan?.overrides ?? []).map((item) => [item.lessonKey, item]));
  const omitted = new Set(plan?.omitLessonKeys ?? []);
  const includedModules = plan?.moduleOrder ? new Set(plan.moduleOrder) : null;
  let inherited = 0;
  let adapted = 0;
  let flagged = 0;
  const examples: string[] = [];
  const authoredExamples: string[] = [];
  const problems: string[] = [];

  for (const module of manifest.modules) {
    if (includedModules && !includedModules.has(module.key ?? "")) continue;
    for (const lesson of module.lessons) {
      if (!lesson.key || omitted.has(lesson.key)) continue;
      const override = overrides.get(lesson.key);
      if (override?.file) continue;
      inherited += 1;
      let text = fs.readFileSync(path.join(COURSE_SOURCE_DIR, module.dir, lesson.file), "utf8");
      if (override?.replacements?.length) {
        adapted += 1;
        const applied = applyReplacements(text, override.replacements, lesson.key);
        text = applied.text;
        problems.push(...applied.problems);
      }
      if (groceryDetails.test(text)) {
        flagged += 1;
        if (examples.length < 20) examples.push(`${module.dir}/${lesson.file}${override?.replacements?.length ? " (adapted)" : ""}`);
      }
    }
  }

  // Variant-authored files must not leak the shared reference build either.
  const authored: string[] = [];
  for (const override of plan?.overrides ?? []) if (override.file) authored.push(override.file);
  for (const module of plan?.modules ?? []) for (const lesson of module.lessons) {
    authored.push(`variants/${variant.slug}/${module.dir}/${lesson.file}`);
  }
  let authoredFlagged = 0;
  for (const relative of authored) {
    const full = path.join(COURSE_SOURCE_DIR, relative);
    if (!fs.existsSync(full)) continue;
    if (groceryDetails.test(fs.readFileSync(full, "utf8"))) {
      authoredFlagged += 1;
      if (authoredExamples.length < 20) authoredExamples.push(relative);
    }
  }

  const available = manifest.availableVariantSlugs?.includes(variant.slug) ?? false;
  if (available) releaseProblems += flagged + authoredFlagged;
  console.log(
    `${variant.slug}: ${inherited} inherited shared lessons; ${adapted} adapted by replacements; ` +
    `${flagged} still contain FreshMarket details; ${authoredFlagged} variant-authored files contain them` +
    `${available ? " (released)" : " (unreleased)"}`
  );
  for (const example of examples) console.log(`  shared: ${example}`);
  if (flagged > examples.length) console.log(`  ...and ${flagged - examples.length} more shared files`);
  for (const example of authoredExamples) console.log(`  authored: ${example}`);
  if (authoredFlagged > authoredExamples.length) console.log(`  ...and ${authoredFlagged - authoredExamples.length} more authored files`);
  for (const problem of problems) console.log(`  ERROR ${problem}`);
}

if (releaseProblems) {
  console.error(`${releaseProblems} effective variant lessons still contain FreshMarket details. Review, replace or omit them before publication.`);
  process.exitCode = 1;
}
