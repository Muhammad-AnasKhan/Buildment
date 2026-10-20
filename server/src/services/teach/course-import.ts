import type { Prisma } from "../../generated/prisma/index.js";
import { unzipSync } from "fflate";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { load as loadYaml } from "js-yaml";
import { prisma } from "../../db/prisma.js";
import { BadRequestError, ConflictError, TooManyRequestsError, UnprocessableError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";

const execute = promisify(execFile);
const MAX_EXPANDED = 20 * 1024 * 1024;

/** Validate before extracting; never trust paths or declared expansion sizes in an upload. */
export function readCourseZip(buffer: Buffer): Record<string, Uint8Array> {
  let total = 0;
  let count = 0;
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(buffer, { filter: entry => {
      if (++count > 1000 || (total += entry.originalSize) > MAX_EXPANDED) throw new Error("ZIP exceeds 1,000 entries or 20 MB expanded.");
      if (entry.name.includes("\\") || entry.name.startsWith("/") || entry.name.split("/").some(p => p === ".." || p.includes(":"))) {
        throw new Error("ZIP contains an unsafe path.");
      }
      return !entry.name.endsWith("/");
    }});
  } catch (error) {
    throw new BadRequestError(error instanceof Error ? error.message : "Invalid ZIP archive.");
  }
  const manifests = Object.keys(files).filter(name => /(^|\/)course\.yaml$/.test(name));
  if (manifests.length !== 1) throw new BadRequestError("ZIP must contain exactly one course.yaml at its root or inside one course folder.");
  const prefix = manifests[0].slice(0, -"course.yaml".length);
  if (prefix.split("/").filter(Boolean).length > 1) throw new BadRequestError("Place the course at the ZIP root or inside one folder.");
  const result: Record<string, Uint8Array> = {};
  total = 0;
  for (const [name, bytes] of Object.entries(files)) {
    if ((total += bytes.length) > MAX_EXPANDED) throw new BadRequestError("ZIP expands beyond 20 MB.");
    if (!name.startsWith(prefix)) throw new BadRequestError("All files must be inside the course folder.");
    const relative = name.slice(prefix.length);
    if (!/^(course\.yaml|COURSE-OUTLINE\.md|\d+-[a-z0-9-]+\/\d+\.\d+-[a-z0-9-]+\.md)$/.test(relative)) {
      throw new BadRequestError(`Unsupported course file: ${relative}`);
    }
    result[relative] = bytes;
  }
  return result;
}

type ImportPlan = {
  manifest: {
    title: string; description: string; projectGoal: string; difficulty: string;
    estimatedHours: number; coverUrl?: string;
  };
  modules: { title: string; lessons: {
    lessonNum: number; slugPart: string; title: string; summary: string | null;
    source: string; estimatedMinutes: number | null; readerMode: "DEFAULT" | "QUIZ";
    isMilestone: boolean;
    blocks: { id: string; type: Prisma.BlockCreateManyInput["type"]; config: Prisma.InputJsonValue; required: boolean }[];
  }[] }[];
};

let importing = false;

export async function importCourseZip(user: SessionUser, buffer: Buffer) {
  if (importing) throw new TooManyRequestsError("A course import is running. Please try again shortly.");
  importing = true;
  try { return await runCourseImport(user, buffer); }
  finally { importing = false; }
}

async function runCourseImport(user: SessionUser, buffer: Buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new BadRequestError("Upload a ZIP file.");
  const files = readCourseZip(buffer);
  let slug: string;
  try {
    const meta = loadYaml(Buffer.from(files["course.yaml"]).toString("utf8")) as { slug?: unknown };
    if (!meta || typeof meta.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) throw new Error();
    slug = meta.slug;
  } catch { throw new BadRequestError("course.yaml needs a kebab-case slug."); }
  const temporary = await mkdtemp(path.join(tmpdir(), "buildment-course-"));
  try {
    const source = path.join(temporary, "source");
    await mkdir(source);
    for (const [name, bytes] of Object.entries(files)) {
      const target = path.join(source, name);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, bytes);
    }
    const result = path.join(temporary, "result.json");
    const worker = fileURLToPath(new URL("../../../scripts/zip-import/worker.ts", import.meta.url));
    try {
      await execute(process.execPath, ["--import", "tsx", worker, "--course", slug, "--strict"], {
        env: { ...process.env, COURSE_IMPORT_SOURCE: source, COURSE_IMPORT_RESULT: result },
        timeout: 15000, maxBuffer: 1024 * 1024,
      });
    } catch (error) {
      const failure = error as { stdout?: string; stderr?: string };
      const reasons = `${failure.stdout ?? ""}\n${failure.stderr ?? ""}`.trim();
      throw new UnprocessableError("Course validation failed.", "COURSE_IMPORT_INVALID", [reasons || "Validation timed out or could not complete."]);
    }
    const plan = JSON.parse(await readFile(result, "utf8")) as ImportPlan;
    const { title, description, projectGoal, difficulty, estimatedHours, coverUrl } = plan.manifest;
    const metadata = { title, description, projectGoal, difficulty, estimatedHours, coverUrl };
    try {
      const course = await prisma.$transaction(async tx => {
        const created = await tx.course.create({ data: { ...metadata, slug, mentorId: user.id, status: "DRAFT" } });
        for (const [index, module] of plan.modules.entries()) {
          const mod = await tx.module.create({ data: { courseId: created.id, title: module.title, order: index + 1 } });
          for (const lesson of module.lessons) {
            const chapter = await tx.chapter.create({ data: {
              courseId: created.id, moduleId: mod.id, slug: `${index + 1}-${lesson.lessonNum}-${lesson.slugPart}`,
              title: lesson.title, summary: lesson.summary, source: lesson.source, compiled: lesson.source,
              order: lesson.lessonNum, estimatedMinutes: lesson.estimatedMinutes, readerMode: lesson.readerMode,
              isMilestone: lesson.isMilestone,
            }});
            if (lesson.blocks.length) await tx.block.createMany({ data: lesson.blocks.map((block, i) => ({
              ...block, chapterId: chapter.id, order: i + 1, blocking: false, points: 1, tags: [],
            })) });
          }
        }
        return created;
      }, { timeout: 10000, maxWait: 1000 });
      return { courseSlug: course.slug };
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") throw new ConflictError("A course with this slug already exists. Change the slug in course.yaml.");
      throw error;
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
