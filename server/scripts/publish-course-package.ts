/** Trusted, post-review publisher for a course folder in content/import/. */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync, strToU8 } from "fflate";
import { load as loadYaml } from "js-yaml";
import { prisma } from "../src/db/prisma.js";
import { previewCourseZipUpdate, approveCourseZipUpdate } from "../src/services/teach/course-update.js";
import { importCourseZip, parseCourseZip } from "../src/services/teach/course-import.js";

const args = process.argv.slice(2);
const value = (flag: string) => { const index = args.indexOf(flag); return index < 0 ? null : args[index + 1] ?? null; };
const slug = value("--course");
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Pass --course <existing-course-slug>.");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../content/import", slug);

async function packageDirectory(directory: string) {
  const files: Record<string, Uint8Array> = {};
  async function visit(relative: string) {
    for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
      const name = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await visit(name);
      else if (entry.isFile() && /^(course\.yaml|COURSE-OUTLINE\.md|(?:variants\/[a-z0-9-]+\/)?\d+-[a-z0-9-]+\/\d+\.\d+-[a-z0-9-]+\.md)$/.test(name)) {
        files[name] = strToU8(await readFile(path.join(directory, name), "utf8"));
      }
    }
  }
  await visit("");
  if (!files["course.yaml"]) throw new Error(`Missing course.yaml in ${directory}`);
  return Buffer.from(zipSync(files, { level: 6 }));
}

try {
  const manifest = loadYaml(await readFile(path.join(root, "course.yaml"), "utf8")) as
    { publication?: string; creatorEmail?: string; modules?: { key?: string; lessons?: { key?: string }[] }[] } | null;
  if (manifest?.publication !== "create" && manifest?.publication !== "update") {
    throw new Error("Repository course.yaml must declare publication: create or publication: update.");
  }
  if (manifest.modules?.some(module => !module.key || module.lessons?.some(lesson => !lesson.key))) {
    throw new Error("Repository course packages need a stable key for every supplied module and lesson.");
  }
  const course = await prisma.course.findUnique({ where: { slug }, include: { mentor: true } });
  if (manifest.publication === "create" && course) throw new Error(`Course ${slug} already exists. Change publication to update and review a patch.`);
  if (manifest.publication === "update" && !course) throw new Error(`Existing course ${slug} was not found. An update cannot create a course.`);
  const expectRelease = value("--expect-release");
  if (course && args.includes("--approve") && course.activeReleaseId && !expectRelease) {
    throw new Error("Pass --expect-release with the release ID approved by the course creator.");
  }
  if (expectRelease && course?.activeReleaseId !== expectRelease) throw new Error("The active release changed. Review the package again.");
  if (!course && expectRelease) throw new Error("A new course cannot have an expected release.");
  const owner = course?.mentor ?? (manifest.creatorEmail
    ? await prisma.user.findUnique({ where: { email: manifest.creatorEmail } }) : null);
  if (!owner) throw new Error("For creation, set creatorEmail to an existing course creator account in course.yaml.");
  if (owner.role !== "MENTOR" && owner.role !== "ADMIN") throw new Error("creatorEmail must belong to a course creator account.");
  const expectedCreatorId = value("--expect-creator-id");
  if (args.includes("--approve") && !expectedCreatorId) {
    throw new Error("Pass --expect-creator-id from the preview before approval.");
  }
  if (expectedCreatorId && owner.id !== expectedCreatorId) throw new Error("Course creator changed since review. Preview the package again.");
  const actor = { id: owner.id, email: owner.email, name: owner.name,
    image: owner.image, role: owner.role, emailVerified: owner.emailVerified };
  const archive = await packageDirectory(root);
  const preview = course ? await previewCourseZipUpdate(actor, course.id, archive) : null;
  const snapshotFingerprint = preview ? (await prisma.courseImportPreview.findUniqueOrThrow({
    where: { id: preview.previewId }, select: { fingerprint: true },
  })).fingerprint : null;
  const expectedFingerprint = value("--expect-fingerprint");
  if (args.includes("--approve") && course && !expectedFingerprint) {
    throw new Error("Pass --expect-fingerprint from the reviewed preview before approval.");
  }
  if (expectedFingerprint && snapshotFingerprint !== expectedFingerprint) {
    throw new Error("Course content changed since the approved preview. Review the package again.");
  }
  const creation = !course ? await parseCourseZip(archive) : null;
  const review = course
    ? { course: slug, publication: "update", creatorEmail: owner.email, creatorId: owner.id,
        currentReleaseId: course.activeReleaseId, snapshotFingerprint,
        modules: preview!.modules, variants: preview!.variants, warnings: preview!.warnings }
    : { course: slug, publication: "create", creatorEmail: owner.email, creatorId: owner.id,
        currentReleaseId: null, snapshotFingerprint: null,
        modules: creation!.plan.modules.map(module => ({ key: module.key, title: module.title,
          lessons: module.lessons.map(lesson => ({ key: lesson.key, title: lesson.title })) })),
        variants: creation!.plan.variants?.map(variant => ({ slug: variant.slug,
          affectedLessons: variant.overrides.map(override => override.lessonKey) })) ?? [],
        warnings: ["A new draft course will be created for this creator. Publish it from the dashboard after review."] };
  process.stdout.write(JSON.stringify(review, null, 2) + "\n");
  const jsonOut = value("--json-out");
  if (jsonOut) await writeFile(jsonOut, JSON.stringify(review, null, 2));
  if (args.includes("--approve")) {
    if (course) {
      await approveCourseZipUpdate(actor, course.id, preview!.previewId);
      const published = await prisma.course.findUniqueOrThrow({ where: { id: course.id }, select: { activeReleaseId: true } });
      process.stdout.write(`Published release ${published.activeReleaseId} for ${slug}.\n`);
    } else {
      await importCourseZip(actor, archive);
      process.stdout.write(`Created draft course ${slug} for ${owner.email}.\n`);
    }
  } else process.stdout.write("Preview only. Pass --approve after the course creator has reviewed this package.\n");
} finally {
  await prisma.$disconnect();
}
