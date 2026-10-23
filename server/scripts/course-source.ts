/**
 * Resolves which course under courses/ a content script works on.
 *
 * Pass `--course <slug>` (or `--course=<slug>`); the default is the FreshMarket
 * course so existing commands behave as before. A course folder can carry a
 * `course.yaml` with the course metadata and its planned modules and lessons.
 * FreshMarket predates that file and falls back to SEED_COURSE plus the module
 * names in import-course.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import { findCourseFamily } from "../src/shared/lib/course-tracks.js";
import { isSafeProductName } from "../src/shared/lib/content-tokens.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_COURSE_SLUG = "multi-vendor-marketplace";

function courseSlugFromArgs(argv: string[]): string {
  const index = argv.indexOf("--course");
  const inline = argv.find((arg) => arg.startsWith("--course="));
  const slug = index >= 0 ? argv[index + 1] : inline?.slice("--course=".length);
  if (slug === undefined) return DEFAULT_COURSE_SLUG;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`--course expects a kebab-case folder name under courses/, got "${slug}"`);
  }
  return slug;
}

export const COURSE_SLUG = courseSlugFromArgs(process.argv);
// ZIP validation runs the same scripts against an isolated temporary folder.
export const COURSE_SOURCE_DIR = process.env.COURSE_IMPORT_SOURCE ?? path.resolve(__dirname, "../../courses", COURSE_SLUG);
export const COURSE_MANIFEST_PATH = path.join(COURSE_SOURCE_DIR, "course.yaml");

if (!fs.existsSync(COURSE_SOURCE_DIR)) {
  throw new Error(`No course folder at courses/${COURSE_SLUG}/`);
}

const PlannedLessonSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, "Use a stable kebab-case lesson key").optional(),
  file: z.string().regex(/^\d+\.\d+-[a-z0-9-]+\.md$/, "Lesson files look like 01.02-some-slug.md"),
  title: z.string().min(1),
  goal: z.string().min(1),
});

const PlannedModuleSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, "Use a stable kebab-case module key").optional(),
  dir: z.string().regex(/^\d+-[a-z0-9-]+$/, "Module folders look like 01-some-slug"),
  title: z.string().min(1),
  summary: z.string().optional(),
  lessons: z.array(PlannedLessonSchema).min(1),
});

const VariantOverrideSchema = z.object({
  lessonKey: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  // A complete replacement chapter, or exact text replacements within the shared chapter.
  file: z.string().regex(/^variants\/[a-z0-9-]+\/\d+-[a-z0-9-]+\/\d+\.\d+-[a-z0-9-]+\.md$/).optional(),
  replacements: z.array(z.object({ from: z.string().min(1), to: z.string() })).optional(),
}).refine(value => Boolean(value.file) !== Boolean(value.replacements?.length), "Use either a chapter file or text replacements");

export const CourseManifestSchema = z.object({
  slug: z.string(),
  /** Repository publishing requires this explicit intent; dashboard ZIPs may omit it. */
  publication: z.enum(["create", "update"]).optional(),
  creatorEmail: z.email().optional(),
  /** Opt in to publishing this repository package after CI passes on main. */
  repositoryPublish: z.boolean().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  projectGoal: z.string().min(1),
  difficulty: z.enum(["Beginner", "Medium", "Advanced"]),
  estimatedHours: z.number().int().positive(),
  /** Catalog grouping: "tech" (default) or "soft-skills". */
  category: z.enum(["tech", "soft-skills"]).default("tech"),
  coverUrl: z.string().url().optional(),
  /** Built-in family slug or the slug of variantFamily below. */
  family: z.string().optional(),
  variantFamily: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    label: z.string().min(1),
    defaultVariantSlug: z.string().min(1),
    variants: z.array(z.object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), label: z.string().min(1),
      productName: z.string().refine(isSafeProductName, "Use a plain product name without Markdown, quotes, or angle brackets"),
      summary: z.string().min(1), hardestConstraint: z.string().min(1),
      specialisationSlug: z.string().default(""),
      theme: z.object({ accentLight: z.string().regex(/^#[0-9A-Fa-f]{6}$/), onAccentLight: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        accentDark: z.string().regex(/^#[0-9A-Fa-f]{6}$/), onAccentDark: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        headingFont: z.enum(["sans", "serif"]) }).default({ accentLight: "#1D4ED8", onAccentLight: "#FFFFFF",
        accentDark: "#93C5FD", onAccentDark: "#0B1B3A", headingFont: "sans" }),
    })).min(2),
    specialisations: z.array(z.object({ slug: z.string(), label: z.string(), summary: z.string() })).default([]),
  }).optional(),
  modules: z.array(PlannedModuleSchema),
  variants: z.array(z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), overrides: z.array(VariantOverrideSchema).min(1) })).optional(),
  remove: z.object({ moduleKeys: z.array(z.string()).default([]), lessonKeys: z.array(z.string()).default([]) }).optional(),
}).superRefine((manifest, ctx) => {
  if (!manifest.modules.length && !manifest.remove?.moduleKeys.length && !manifest.remove?.lessonKeys.length &&
      !manifest.variants?.some(variant => variant.overrides.length)) {
    ctx.addIssue({ code: "custom", path: ["modules"], message: "Provide lessons, variant overrides, or explicit removals" });
  }
  if (manifest.publication === "create" && !manifest.modules.length) {
    ctx.addIssue({ code: "custom", path: ["modules"], message: "A new course needs at least one module" });
  }
  if (manifest.family && !findCourseFamily(manifest.family) && manifest.variantFamily?.slug !== manifest.family) {
    ctx.addIssue({ code: "custom", path: ["family"], message: "family must name a built-in family or match variantFamily.slug" });
  }
  if (manifest.variantFamily) {
    if (manifest.family !== manifest.variantFamily.slug) ctx.addIssue({ code: "custom", path: ["variantFamily"], message: "variantFamily.slug must match family" });
    const slugs = manifest.variantFamily.variants.map(variant => variant.slug);
    if (new Set(slugs).size !== slugs.length) ctx.addIssue({ code: "custom", path: ["variantFamily", "variants"], message: "Variant slugs must be unique" });
    if (!slugs.includes(manifest.variantFamily.defaultVariantSlug)) ctx.addIssue({ code: "custom", path: ["variantFamily", "defaultVariantSlug"], message: "Default variant must exist" });
  }
  const modules = new Set<string>();
  const lessons = new Set<string>();
  for (const [mi, module] of manifest.modules.entries()) {
    if (module.key) {
      if (modules.has(module.key)) ctx.addIssue({ code: "custom", path: ["modules", mi, "key"], message: "Module key must be unique in this course" });
      modules.add(module.key);
    }
    for (const [li, lesson] of module.lessons.entries()) {
      if (!lesson.key) continue;
      if (lessons.has(lesson.key)) ctx.addIssue({ code: "custom", path: ["modules", mi, "lessons", li, "key"], message: "Lesson key must be unique in this course" });
      lessons.add(lesson.key);
    }
  }
  const family = manifest.variantFamily ?? findCourseFamily(manifest.family);
  const variants = new Set<string>();
  for (const [vi, variant] of (manifest.variants ?? []).entries()) {
    if (!family || !family.variants.some(item => item.slug === variant.slug)) ctx.addIssue({ code: "custom", path: ["variants", vi, "slug"], message: "Variant must exist in the selected course family" });
    if (variants.has(variant.slug)) ctx.addIssue({ code: "custom", path: ["variants", vi, "slug"], message: "Duplicate variant" });
    variants.add(variant.slug);
    const overridden = new Set<string>();
    for (const [oi, override] of variant.overrides.entries()) {
      if (overridden.has(override.lessonKey)) ctx.addIssue({ code: "custom", path: ["variants", vi, "overrides", oi], message: "Duplicate lesson override" });
      overridden.add(override.lessonKey);
      if (override.file && !override.file.startsWith(`variants/${variant.slug}/`)) ctx.addIssue({ code: "custom", path: ["variants", vi, "overrides", oi, "file"], message: "Override file must belong to its variant" });
    }
  }
  for (const key of manifest.remove?.moduleKeys ?? []) if (modules.has(key)) ctx.addIssue({ code: "custom", path: ["remove", "moduleKeys"], message: `Cannot remove and update module ${key}` });
  for (const key of manifest.remove?.lessonKeys ?? []) if (lessons.has(key)) ctx.addIssue({ code: "custom", path: ["remove", "lessonKeys"], message: `Cannot remove and update lesson ${key}` });
  for (const field of ["moduleKeys", "lessonKeys"] as const) {
    const keys = manifest.remove?.[field] ?? [];
    if (new Set(keys).size !== keys.length) ctx.addIssue({ code: "custom", path: ["remove", field], message: "Removal keys must be unique" });
  }
  for (const variant of manifest.variants ?? []) for (const override of variant.overrides) {
    if (manifest.remove?.lessonKeys.includes(override.lessonKey)) {
      ctx.addIssue({ code: "custom", path: ["variants", variant.slug], message: `Cannot override and remove lesson ${override.lessonKey}` });
    }
  }
});

export type CourseManifest = z.infer<typeof CourseManifestSchema>;

/** The parsed course.yaml, or null for a course without one (FreshMarket). Throws if it is invalid. */
export function loadCourseManifest(): CourseManifest | null {
  if (!fs.existsSync(COURSE_MANIFEST_PATH)) return null;
  const raw = loadYaml(fs.readFileSync(COURSE_MANIFEST_PATH, "utf8"));
  const result = CourseManifestSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
    throw new Error(`course.yaml is invalid: ${issues.join("; ")}`);
  }
  if (result.data.slug !== COURSE_SLUG) {
    throw new Error(`course.yaml slug "${result.data.slug}" must match its folder name "${COURSE_SLUG}"`);
  }
  return result.data;
}
