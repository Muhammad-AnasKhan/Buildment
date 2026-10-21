import { describe, expect, it } from "vitest";
import {
  applyTokens,
  applyTokensDeep,
  collectContentTokenProblems,
  contentTokenValues,
  findContentTokens,
  tokenInFieldProblem,
} from "../../../../src/shared/lib/content-tokens.js";
import { COURSE_FAMILIES } from "../../../../src/shared/lib/course-tracks.js";
import { secretFieldsWithTokens } from "../../../../src/utils/sanitize-block-config.js";

const books = contentTokenValues("multi-vendor-marketplace", "books");

describe("contentTokenValues", () => {
  it("uses the learner's variant product", () => {
    expect(books).toEqual({ "product.name": "Hamesh" });
    expect(contentTokenValues("multi-vendor-marketplace", "services")["product.name"]).toBe("SkillSlot");
  });

  it("falls back to the family default, then to FreshMarket", () => {
    expect(contentTokenValues("multi-vendor-marketplace", null)["product.name"]).toBe("FreshMarket");
    expect(contentTokenValues("multi-vendor-marketplace", "retired-variant")["product.name"]).toBe("FreshMarket");
    expect(contentTokenValues(null, "books")["product.name"]).toBe("FreshMarket");
    expect(contentTokenValues("unknown-family", "books")["product.name"]).toBe("FreshMarket");
  });
});

describe("applyTokens", () => {
  it("replaces every known token in prose, attributes and code", () => {
    const source = 'Open your %%product.name%% dashboard.\n\n<Callout title="%%product.name%% tip" />\n\n```ts\nconst app = "%%product.name%%";\n```';
    expect(applyTokens(source, books)).toBe('Open your Hamesh dashboard.\n\n<Callout title="Hamesh tip" />\n\n```ts\nconst app = "Hamesh";\n```');
  });

  it("leaves unknown tokens, Mermaid comments and plain percent signs alone", () => {
    const source = "%%project.slug%% stays. 50%% off. %%{init: {}}%%\n%% a mermaid comment";
    expect(applyTokens(source, books)).toBe(source);
  });

  it("walks block configs without touching non-strings", () => {
    const config = { question: "Why does %%product.name%% reserve stock?", options: [{ id: "a", text: "%%product.name%% A" }], points: 2, flag: true, none: null };
    expect(applyTokensDeep(config, books)).toEqual({ question: "Why does Hamesh reserve stock?", options: [{ id: "a", text: "Hamesh A" }], points: 2, flag: true, none: null });
    expect(config.question).toContain("%%product.name%%");
  });
});

describe("token validation", () => {
  it("finds token names in order", () => {
    expect(findContentTokens("%%product.name%% and %%project.slug%%")).toEqual(["product.name", "project.slug"]);
  });

  it("accepts known tokens in prose", () => {
    expect(collectContentTokenProblems("Your %%product.name%% vendors sign up here.")).toEqual([]);
  });

  it("rejects unknown tokens once each", () => {
    const problems = collectContentTokenProblems("%%product.title%% and %%product.title%%");
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("%%product.title%%");
  });

  it("rejects tokens in ATX and setext headings but not in fenced code", () => {
    expect(collectContentTokenProblems("## Inside %%product.name%%")).toHaveLength(1);
    expect(collectContentTokenProblems("Inside %%product.name%%\n---")).toHaveLength(1);
    expect(collectContentTokenProblems("```md\n## Inside %%product.name%%\n```")).toEqual([]);
  });

  it("flags tokens in titles and other metadata", () => {
    expect(tokenInFieldProblem("chapter title", "Build %%product.name%%")).toContain("chapter title");
    expect(tokenInFieldProblem("chapter title", "Build the cart")).toBeNull();
    expect(tokenInFieldProblem("chapter summary", null)).toBeNull();
  });

  it("reports secret block config fields that hold tokens", () => {
    const config = {
      question: "%%product.name%% is fine in a prompt",
      rubric: "Mentions %%product.name%%",
      tests: [{ input: "x", expected: "%%product.name%%" }],
      correctOptionIds: ["a"],
    };
    expect(secretFieldsWithTokens(config)).toEqual(["rubric", "tests"]);
  });
});

describe("catalogue product names", () => {
  it("are safe to insert into MDX as plain text", () => {
    for (const family of COURSE_FAMILIES) {
      for (const variant of family.variants) expect(variant.productName).toMatch(/^[\p{L}\p{N}][\p{L}\p{N} ’-]*$/u);
    }
  });
});
