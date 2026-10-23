import { describe, expect, it } from "vitest";
import { parseLesson, transformPresentationBlocks, type PendingBlock } from "../../scripts/import-course.js";
import { QuizConfigSchema } from "../../src/shared/blocks/quiz/schema.js";

describe("course importer numeric quiz labels", () => {
  it("imports chapter 14.7's unquoted numeric YAML options as display strings", () => {
    const lesson = parseLesson(14, "14-browse-catalogue-api", "14.07-quiz.md", 7, "quiz");
    const quizzes = lesson.blocks.filter(block => block.type === "QUIZ");
    expect(quizzes).toHaveLength(3);
    const first = QuizConfigSchema.parse(quizzes[0].config);
    expect(first.options).toEqual([1, 2, 20, 21].map((value, i) => ({ id: `opt-${i}`, label: String(value) })));
    expect(first.correctOptionIds).toEqual(["opt-3"]);
    for (const block of quizzes) expect(QuizConfigSchema.safeParse(block.config).success).toBe(true);
  });
  it("normalizes legacy scalar labels while rejecting missing or structured labels", () => {
    const config = { prompt: "Choose", options: [{ id: "a", label: 0 }, { id: "b", label: false }], correctOptionIds: ["a"] };
    expect(QuizConfigSchema.parse(config).options.map(option => option.label)).toEqual(["0", "false"]);
    for (const label of [null, undefined, {}, []]) expect(QuizConfigSchema.safeParse({ ...config, options: [{ id: "a", label }, config.options[1]] }).success).toBe(false);
  });
});

describe("course importer interaction intent", () => {
  it("does not invent an OpenQuestion for a lesson without an authored interaction", () => {
    const lesson = parseLesson(
      12,
      "12-vendor-dashboard",
      "12.06-product-list-page.md",
      6,
      "product-list-page"
    );

    expect(lesson.blocks).toHaveLength(0);
    expect(lesson.source).not.toContain("<OpenQuestion");
    expect(lesson.source).not.toContain(
      "Before moving on: in 2–3 sentences, what was the main takeaway"
    );
  });

  it("keeps a prose reflection as prose instead of turning it into mentor-reviewed work", () => {
    const lesson = parseLesson(
      5,
      "05-data-model-and-seed",
      "05.02-the-denormalisation-trap.md",
      2,
      "the-denormalisation-trap"
    );

    expect(lesson.source).toContain("## Reflect");
    expect(lesson.source).not.toContain("<OpenQuestion");
  });

  it("keeps an inline course roadmap as MDX instead of escaping its props", () => {
    const lesson = parseLesson(
      1,
      "01-introduction",
      "01.06-course-outline.md",
      6,
      "course-outline"
    );

    expect(lesson.source).toContain('<Roadmap title="FreshMarket build path"');
    expect(lesson.source).not.toContain("&lt;Roadmap");
  });
});

describe("course importer inline code", () => {
  it.each([
    ["10-open-your-shop", "10.06-scaffold-vendor-layout.md", 6, "scaffold-vendor-layout", ["`<Outlet />`", "`/vendor/*`"]],
    ["02-project-skeleton", "02.13-client-shell-and-routing.md", 13, "client-shell-and-routing", ["`<App />`", "`<p>`", '`<div id="api-status">`']],
  ] as const)("keeps JSX code spans intact in %s/%s", (moduleDir, fileName, lessonNum, slugPart, spans) => {
    const lesson = parseLesson(Number(moduleDir.slice(0, 2)), moduleDir, fileName, lessonNum, slugPart);

    for (const span of spans) expect(lesson.source).toContain(span);
    expect(lesson.source).not.toContain("'&lt;");
  });
});

describe("course importer optional MustRead", () => {
  const mustRead = (attrs: string) => {
    const blocks: PendingBlock[] = [];
    transformPresentationBlocks(
      `<MustRead\n  title="T"\n  url="https://example.com/a"\n  description="D"\n${attrs}/>`,
      (block) => {
        blocks.push(block);
        return "";
      }
    );
    expect(blocks).toHaveLength(1);
    return blocks[0]!;
  };

  it("keeps a MustRead required by default", () => {
    expect(mustRead("").required).toBe(true);
    expect(mustRead('  required="true"\n').required).toBe(true);
  });

  it('imports required="false" and required={false} as an optional block', () => {
    expect(mustRead('  required="false"\n').required).toBe(false);
    expect(mustRead("  required={false}\n").required).toBe(false);
  });

  it("keeps the flag out of the card config so block ids survive a re-import", () => {
    expect(mustRead('  required="false"\n').config).not.toHaveProperty("required");
  });

  it("imports the example card in chapter 1.2 as optional", () => {
    const lesson = parseLesson(1, "01-introduction", "01.02-how-to-use-this-course.md", 2, "how-to-use-this-course");
    const reads = lesson.blocks.filter((block) => block.type === "MUST_READ");

    expect(reads).toHaveLength(1);
    expect(reads[0]!.required).toBe(false);
    // Only the two authored short-answer quizzes gate the chapter, as before the card was restored.
    expect(lesson.blocks.filter((block) => block.required).map((block) => block.type)).toEqual(["OPEN_QUESTION", "OPEN_QUESTION"]);
    expect(lesson.source).toContain(`<MustRead id="${reads[0]!.id}" />`);
  });
});

describe("course importer gate recaps", () => {
  it("keeps a gate's ChapterRecap and still strips its optional enrichment", () => {
    const lesson = parseLesson(3, "03-why-mongodb", "03.11-checklist.md", 11, "checklist");
    const recaps = lesson.blocks.filter((block) => block.type === "CHAPTER_RECAP");

    expect(recaps).toHaveLength(1);
    expect(lesson.source).toContain(`<ChapterRecap id="${recaps[0]!.id}" />`);
    expect(lesson.source).not.toContain("<BigWordAlert");
    expect(lesson.blocks.some((block) => block.type === "MUST_READ")).toBe(false);
  });
});
