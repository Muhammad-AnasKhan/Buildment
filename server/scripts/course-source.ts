/**
 * Resolves which course under content/import/ a content script works on.
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_COURSE_SLUG = "multi-vendor-marketplace";

function courseSlugFromArgs(argv: string[]): string {
  const index = argv.indexOf("--course");
  const inline = argv.find((arg) => arg.startsWith("--course="));
  const slug = index >= 0 ? argv[index + 1] : inline?.slice("--course=".length);
  if (slug === undefined) return DEFAULT_COURSE_SLUG;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`--course expects a kebab-case folder name under content/import/, got "${slug}"`);
  }
  return slug;
}

export const COURSE_SLUG = courseSlugFromArgs(process.argv);
export const COURSE_SOURCE_DIR = path.resolve(__dirname, "../../content/import", COURSE_SLUG);
export const COURSE_OUTPUT_DIR = path.resolve(__dirname, "../../content/transformed", COURSE_SLUG);
export const COURSE_MANIFEST_PATH = path.join(COURSE_SOURCE_DIR, "course.yaml");

if (!fs.existsSync(COURSE_SOURCE_DIR)) {
  throw new Error(`No course folder at content/import/${COURSE_SLUG}/`);
}

const PlannedLessonSchema = z.object({
  file: z.string().regex(/^\d+\.\d+-[a-z0-9-]+\.md$/, "Lesson files look like 01.02-some-slug.md"),
  title: z.string().min(1),
  goal: z.string().min(1),
});

const PlannedModuleSchema = z.object({
  dir: z.string().regex(/^\d+-[a-z0-9-]+$/, "Module folders look like 01-some-slug"),
  title: z.string().min(1),
  summary: z.string().optional(),
  lessons: z.array(PlannedLessonSchema).min(1),
});

export const CourseManifestSchema = z.object({
  slug: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  projectGoal: z.string().min(1),
  difficulty: z.enum(["Beginner", "Medium", "Advanced"]),
  estimatedHours: z.number().int().positive(),
  coverUrl: z.string().url().optional(),
  modules: z.array(PlannedModuleSchema).min(1),
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
