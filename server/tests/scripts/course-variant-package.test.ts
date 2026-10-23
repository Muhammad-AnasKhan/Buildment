import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { zipSync, strToU8 } from "fflate";
import { load, dump } from "js-yaml";
import { parseCourseZip } from "../../src/services/teach/course-import.js";
import { importCourseZip } from "../../src/services/teach/course-import.js";
import { prisma } from "../../src/db/prisma.js";
import { randomUUID } from "node:crypto";
import { getCourseOverview } from "../../src/services/courses/overview.js";
import { chooseCourseVariant } from "../../src/services/courses/track.js";
import { loadChapterReader } from "../../src/services/chapters/reader.js";
import { saveChapterDraft } from "../../src/services/teach/chapters.js";

describe("course ZIP variant overrides", () => {
  it("keeps explicit removals in a package with no lesson files", async () => {
    const directory = new URL("../../../content/import/collaboration/", import.meta.url);
    const manifest = load(readFileSync(new URL("course.yaml", directory), "utf8")) as Record<string, unknown>;
    manifest.slug = `remove-only-${randomUUID()}`;
    manifest.publication = "update";
    manifest.modules = [];
    manifest.remove = { moduleKeys: [], lessonKeys: ["retired-lesson"] };
    const archive = Buffer.from(zipSync({ "course.yaml": strToU8(dump(manifest)) }));
    const parsed = await parseCourseZip(archive);
    expect(parsed.plan.modules).toEqual([]);
    expect(parsed.plan.remove).toEqual({ moduleKeys: [], lessonKeys: ["retired-lesson"] });
    await expect(importCourseZip({} as Parameters<typeof importCourseZip>[0], archive))
      .rejects.toThrow("declares an update");
  }, 30000);

  it("refuses to create a course from a declared update package", async () => {
    const directory = new URL("../../../content/import/collaboration/", import.meta.url);
    const files: Record<string, Uint8Array> = {};
    for (const entry of readdirSync(directory, { withFileTypes: true })) if (entry.isDirectory()) {
      for (const file of readdirSync(new URL(`${entry.name}/`, directory))) {
        files[`${entry.name}/${file}`] = strToU8(readFileSync(new URL(`${entry.name}/${file}`, directory), "utf8"));
      }
    }
    const manifest = load(readFileSync(new URL("course.yaml", directory), "utf8")) as Record<string, unknown>;
    manifest.slug = `update-only-${randomUUID()}`;
    manifest.publication = "update";
    files["course.yaml"] = strToU8(dump(manifest));
    await expect(importCourseZip({} as Parameters<typeof importCourseZip>[0], Buffer.from(zipSync(files))))
      .rejects.toThrow("declares an update");
  }, 30000);

  it("parses a text replacement and a whole chapter replacement", async () => {
    const directory = new URL("../../../content/import/collaboration/", import.meta.url);
    const files: Record<string, Uint8Array> = {};
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        for (const file of readdirSync(new URL(`${entry.name}/`, directory))) {
          files[`${entry.name}/${file}`] = strToU8(readFileSync(new URL(`${entry.name}/${file}`, directory), "utf8"));
        }
      }
    }
    const manifest = load(readFileSync(new URL("course.yaml", directory), "utf8")) as Record<string, unknown> & {
      modules: { lessons: { key?: string }[] }[];
    };
    manifest.family = "multi-vendor-marketplace";
    manifest.modules[0].lessons[0].key = "scene";
    manifest.modules[0].lessons[1].key = "roles";
    manifest.variants = [{ slug: "books", overrides: [
      { lessonKey: "scene", replacements: [{ from: "Almost always, the second one.", to: "For the books team, the second one." }] },
      { lessonKey: "roles", file: "variants/books/01-how-good-teams-work/01.02-roles-and-expectations.md" },
    ] }];
    files["course.yaml"] = strToU8(dump(manifest));
    files["variants/books/01-how-good-teams-work/01.02-roles-and-expectations.md"] = strToU8(
      "---\ntitle: Books team roles\nsummary: Assign book catalog work.\nestimatedMinutes: 5\n---\n\n## Roles\n\nAssign the ISBN matching and copy grading tasks.\n");
    const parsed = await parseCourseZip(Buffer.from(zipSync(files)));
    const overrides = parsed.plan.variants?.[0].overrides;
    expect(overrides?.[0].lesson.source).toContain("For the books team, the second one.");
    expect(overrides?.[1].lesson.title).toBe("Books team roles");
  }, 30000);

  it("creates a course with its own two variants and materialized override", async () => {
    const directory = new URL("../../../content/import/collaboration/", import.meta.url);
    const files: Record<string, Uint8Array> = {};
    for (const entry of readdirSync(directory, { withFileTypes: true })) if (entry.isDirectory()) {
      for (const file of readdirSync(new URL(`${entry.name}/`, directory))) {
        files[`${entry.name}/${file}`] = strToU8(readFileSync(new URL(`${entry.name}/${file}`, directory), "utf8"));
      }
    }
    const slug = `custom-variant-${randomUUID()}`;
    const manifest = load(readFileSync(new URL("course.yaml", directory), "utf8")) as Record<string, unknown> & {
      modules: { dir: string; key?: string; lessons: { file: string; key?: string }[] }[];
    };
    manifest.slug = slug;
    manifest.family = slug;
    manifest.variantFamily = { slug, label: "Team projects", defaultVariantSlug: "food", variants: [
      { slug: "food", label: "Food", productName: "FreshMarket", summary: "Build a food app", hardestConstraint: "Inventory" },
      { slug: "electricity", label: "Electricity", productName: "GridMarket", summary: "Build a grid app", hardestConstraint: "Matching" },
    ] };
    for (const module of manifest.modules) {
      module.key = module.dir.replace(/^\d+-/, "");
      for (const lesson of module.lessons) lesson.key = `${module.key}-${lesson.file.replace(/^\d+\.\d+-/, "").replace(/\.md$/, "")}`;
    }
    const targetKey = manifest.modules[0].lessons[0].key!;
    manifest.variants = [{ slug: "electricity", overrides: [{ lessonKey: targetKey,
      replacements: [{ from: "Almost always, the second one.", to: "The electricity team picks the second one." }] }] }];
    files["course.yaml"] = strToU8(dump(manifest));
    const owner = await prisma.user.create({ data: { email: `${slug}@test.local`, role: "MENTOR", emailVerified: new Date() } });
    let learnerId: string | null = null;
    try {
      expect((await importCourseZip(owner, Buffer.from(zipSync(files)))).courseSlug).toBe(slug);
      const course = await prisma.course.findUniqueOrThrow({ where: { slug }, include: { releases: true } });
      expect(course.activeReleaseId).not.toBeNull();
      const active = course.releases.find(release => release.id === course.activeReleaseId)!;
      const variants = (active.content as any).variants;
      expect(variants.food[0].chapters[0].id).not.toBe(variants.electricity[0].chapters[0].id);
      const chapter = await prisma.chapter.findUniqueOrThrow({ where: { id: variants.electricity[0].chapters[0].id } });
      expect(chapter.source).toContain("The electricity team picks the second one.");
      await prisma.course.update({ where: { id: course.id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
      await expect(saveChapterDraft(owner, chapter.id, "An unsafe direct edit"))
        .rejects.toThrow("Chapter not found");
      expect((await prisma.chapter.findUniqueOrThrow({ where: { id: chapter.id } })).source).toBe(chapter.source);
      const learner = await prisma.user.create({ data: { email: `learner-${slug}@test.local`, role: "MENTEE", emailVerified: new Date() } });
      learnerId = learner.id;
      await prisma.enrollment.create({ data: { courseId: course.id, userId: learner.id, lifecycle: "ACTIVE" } });
      expect((await getCourseOverview(slug, learner)).track?.family?.variants.map(variant => variant.slug)).toEqual(["food", "electricity"]);
      expect((await chooseCourseVariant(slug, learner, "electricity")).track.variantSlug).toBe("electricity");
      const reader = await loadChapterReader(slug, variants.electricity[0].chapters[0].slug, learner);
      expect(reader.content?.source).toContain("The electricity team picks the second one.");
    } finally {
      await prisma.course.deleteMany({ where: { slug } });
      if (learnerId) await prisma.user.delete({ where: { id: learnerId } });
      await prisma.user.delete({ where: { id: owner.id } });
    }
  }, 30000);
});
