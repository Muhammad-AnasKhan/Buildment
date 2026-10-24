/** Report grocery-specific shared lessons that a marketplace variant still inherits.
 *
 * This is a conservative content review aid, not a substitute for reading the
 * whole path. A released variant must have zero unreviewed findings.
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
const groceryDetails = /\b(?:freshmarket|grocer\w*|produce|apples?|milk|tomatoes?|olive oil|bakery|perish\w*|kilograms?|vegetables?|fruits?)\b/i;
type VariantPlan = {
  slug: string;
  overrides?: Array<{ lessonKey: string }>;
  omitLessonKeys?: string[];
  moduleOrder?: string[];
};
const variants = (manifest.variants ?? []) as VariantPlan[];
let releaseProblems = 0;

for (const variant of family.variants.filter(item => item.slug !== family.defaultVariantSlug)) {
  const plan = variants.find(item => item.slug === variant.slug);
  const overridden = new Set(plan?.overrides?.map(item => item.lessonKey) ?? []);
  const omitted = new Set(plan?.omitLessonKeys ?? []);
  const includedModules = plan?.moduleOrder ? new Set(plan.moduleOrder) : null;
  const inherited = manifest.modules.flatMap(module => {
    if (includedModules && !includedModules.has(module.key ?? "")) return [];
    return module.lessons.filter(lesson => !overridden.has(lesson.key ?? "") && !omitted.has(lesson.key ?? ""))
      .map(lesson => ({ module, lesson }));
  });
  const flagged = inherited.filter(({ module, lesson }) =>
    groceryDetails.test(fs.readFileSync(path.join(COURSE_SOURCE_DIR, module.dir, lesson.file), "utf8")));
  const available = manifest.availableVariantSlugs?.includes(variant.slug) ?? false;
  if (available) releaseProblems += flagged.length;
  console.log(`${variant.slug}: ${inherited.length} inherited shared lessons; ${flagged.length} contain FreshMarket details${available ? " (released)" : " (unreleased)"}`);
  for (const { module, lesson } of flagged.slice(0, 20)) console.log(`  ${module.dir}/${lesson.file}`);
  if (flagged.length > 20) console.log(`  ...and ${flagged.length - 20} more`);
}

if (releaseProblems) {
  console.error(`${releaseProblems} released-variant lessons still inherit FreshMarket details. Review or override them before publication.`);
  process.exitCode = 1;
}
