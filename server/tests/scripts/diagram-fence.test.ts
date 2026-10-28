import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type * as ImportCourse from "../../scripts/import-course.js";
import type * as ValidateCourseSource from "../../scripts/validate-course-source.js";

// The importer reads COURSE_IMPORT_SOURCE once at load, so point it at a scratch
// course before importing the scripts.
let temporary = "";
let importer: typeof ImportCourse;
let validator: typeof ValidateCourseSource;

const MODULE = "01-introduction";
const TICKS = "```";
const chapter = (spec: string) => `# Finding a site\n\nYour phone asks first.\n\n${TICKS}flow\n${spec}\n${TICKS}\n\nThen it loads the page.\n`;

async function lesson(name: string, body: string) {
  await writeFile(path.join(temporary, MODULE, name), body);
  const match = name.match(/^(\d+)\.(\d+)-([a-z0-9-]+)\.md$/)!;
  return importer.parseLesson(Number(match[1]), MODULE, name, Number(match[2]), match[3]!);
}

beforeAll(async () => {
  temporary = await mkdtemp(path.join(tmpdir(), "diagram-fence-"));
  await mkdir(path.join(temporary, MODULE));
  process.env.COURSE_IMPORT_SOURCE = temporary;
  importer = await import("../../scripts/import-course.js");
  validator = await import("../../scripts/validate-course-source.js");
});
afterAll(async () => {
  delete process.env.COURSE_IMPORT_SOURCE;
  await rm(temporary, { recursive: true, force: true });
});

describe("flow fence in a course chapter", () => {
  it("is stored as written and passes validation", async () => {
    const spec = "title: Finding a site\nactor You\nbox DNS\nend Server\nYou -> DNS -> Server";
    const parsed = await lesson("01.01-valid.md", chapter(spec));
    expect(parsed.source).toContain(`${TICKS}flow\n${spec}\n${TICKS}`);
    expect(() => validator.validateParsedLesson(parsed)).not.toThrow();
  });

  it("fails validation with the chapter line of the mistake", async () => {
    const parsed = await lesson("01.02-bad.md", chapter("title: Finding a site\nactor You\nbox DNS\nYou -> Sever"));
    expect(() => validator.validateParsedLesson(parsed)).toThrow(/line \d+: "Sever" is not declared/);
  });
});
