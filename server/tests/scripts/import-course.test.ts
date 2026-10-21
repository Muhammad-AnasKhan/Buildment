import { describe, expect, it } from "vitest";
import { parseLesson, transformPresentationBlocks, type PendingBlock } from "../../scripts/import-course.js";

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
