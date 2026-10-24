import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AiInterviewConfigSchema } from "../../src/shared/blocks/ai-interview/schema.js";

// The importer reads COURSE_IMPORT_SOURCE once at load, so point it at a scratch
// course before importing the scripts.
let temporary = "";
let importer: typeof import("../../scripts/import-course.js");
let validator: typeof import("../../scripts/validate-course-source.js");

const MODULE = "01-introduction";
const TICKS = "```";
const fence = (yaml: string) => `Practise out loud.\n\n${TICKS}aiinterview\n${yaml}\n${TICKS}\n\nThen move on.\n`;
const VALID = [
  "title: Payments interview",
  "opening: Tell me about a payment feature you built.",
  "focus: [ownership, impact, five-whys]",
  "context: resume",
  "maxTurns: 8",
  "whyDepth: 3",
  "rubric: A strong answer names retries with backoff.",
].join("\n");

async function lesson(name: string, body: string) {
  await writeFile(path.join(temporary, MODULE, name), body);
  const match = name.match(/^(\d+)\.(\d+)-([a-z0-9-]+)\.md$/)!;
  return importer.parseLesson(Number(match[1]), MODULE, name, Number(match[2]), match[3]!);
}

beforeAll(async () => {
  temporary = await mkdtemp(path.join(tmpdir(), "aiinterview-fence-"));
  await mkdir(path.join(temporary, MODULE));
  process.env.COURSE_IMPORT_SOURCE = temporary;
  importer = await import("../../scripts/import-course.js");
  validator = await import("../../scripts/validate-course-source.js");
});
afterAll(async () => {
  delete process.env.COURSE_IMPORT_SOURCE;
  await rm(temporary, { recursive: true, force: true });
});

describe("aiinterview fence", () => {
  it("becomes an AI_INTERVIEW block with a placeholder tag and the rubric kept in config", async () => {
    const parsed = await lesson("01.01-valid.md", fence(VALID));
    expect(parsed.blocks).toHaveLength(1);
    const block = parsed.blocks[0]!;
    expect(block.type).toBe("AI_INTERVIEW");
    expect(block.required).toBe(false);
    expect(block.config).toMatchObject({
      title: "Payments interview",
      focus: ["ownership", "impact", "five-whys"],
      context: "resume",
      maxTurns: 8,
      whyDepth: 3,
      rubric: "A strong answer names retries with backoff.",
    });
    expect(block.config).not.toHaveProperty("required");
    expect(AiInterviewConfigSchema.safeParse(block.config).success).toBe(true);
    expect(parsed.source).toContain(`<AiInterview id="${block.id}" />`);
    expect(parsed.source).not.toContain(`${TICKS}aiinterview`);
    expect(() => validator.validateParsedLesson(parsed)).not.toThrow();
  });

  it("fills defaults and honours required: true", async () => {
    const parsed = await lesson("01.02-defaults.md", fence("title: Short\nopening: Hello?\nrequired: true"));
    const block = parsed.blocks[0]!;
    expect(block.required).toBe(true);
    expect(block.config).toMatchObject({ context: "none", maxTurns: 10, whyDepth: 5, focus: ["ownership", "impact", "five-whys"] });
  });

  it.each([
    ["a misspelled key", `${VALID}\nmaxTurn: 3`, /maxTurn/],
    ["an unknown focus area", VALID.replace("[ownership, impact, five-whys]", "[ownership, trivia]"), /focus/],
    ["more than 20 turns", VALID.replace("maxTurns: 8", "maxTurns: 21"), /maxTurns/],
    ["no opening question", VALID.replace(/opening: .*\n/, ""), /opening/],
  ])("stops the import with the reason for %s", async (_name, yaml, reason) => {
    await expect(lesson("01.03-bad.md", fence(yaml))).rejects.toThrow(reason);
  });

  it("refuses a placeholder inside the server-only rubric", async () => {
    const parsed = await lesson("01.04-token.md", fence(VALID.replace(/rubric: .*/, "rubric: Mentions %%product.name%%.")));
    expect(() => validator.validateParsedLesson(parsed)).toThrow(/placeholder/);
  });

  it("is not allowed inside a quiz chapter, which takes activities only", async () => {
    await writeFile(path.join(temporary, MODULE, "01.05-quiz.md"), `---\nstepType: quiz\n---\n\n${TICKS}aiinterview\n${VALID}\n${TICKS}\n`);
    const { failed } = validator.findBrokenChapters();
    expect(failed.find((item) => item.file.endsWith("01.05-quiz.md"))?.error).toMatch(/activities only/);
  });
});
