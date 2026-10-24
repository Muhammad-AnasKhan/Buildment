/** Exercise the full trusted ZIP parser for the currently planned marketplace files.
 *
 * Draft variant files may be present while authors work. The strict structure
 * audit checks those separately; this snapshot tests exactly what course.yaml
 * would send to the repository release service.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import { CourseManifestSchema, coursesRootForServer } from "./course-source.js";
import { packageZip, publishingSettings } from "./repository-course-publish.js";
import { parseCourseZip } from "../src/services/teach/course-import.js";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(coursesRootForServer(serverRoot), "multi-vendor-marketplace");
const manifest = CourseManifestSchema.parse(loadYaml(fs.readFileSync(path.join(source, "course.yaml"), "utf8")));
const snapshot = fs.mkdtempSync(path.join(os.tmpdir(), "buildment-marketplace-package-"));

function copy(relative: string) {
  const from = path.resolve(source, relative);
  if (!from.startsWith(`${source}${path.sep}`)) throw new Error(`Unsafe package path: ${relative}`);
  const to = path.join(snapshot, relative);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

try {
  copy("course.yaml");
  if (fs.existsSync(path.join(source, "COURSE-OUTLINE.md"))) copy("COURSE-OUTLINE.md");
  for (const module of manifest.modules) for (const lesson of module.lessons) copy(`${module.dir}/${lesson.file}`);
  for (const variant of manifest.variants ?? []) {
    for (const override of variant.overrides ?? []) if (override.file) copy(override.file);
    for (const module of variant.modules ?? []) for (const lesson of module.lessons) {
      copy(`variants/${variant.slug}/${module.dir}/${lesson.file}`);
    }
  }
  const zip = packageZip({ slug: manifest.slug, dir: snapshot, manifest }, "update", publishingSettings().instructorEmail);
  const parsed = await parseCourseZip(zip, "repository");
  const modules = parsed.plan.variants?.map(variant => `${variant.slug}: ${variant.modules?.length ?? 0} own modules`) ?? [];
  console.log(`Marketplace package: ${zip.length} bytes, ${parsed.plan.modules.length} shared modules, ${modules.join(", ")}`);
} finally {
  fs.rmSync(snapshot, { recursive: true, force: true });
}
