import { describe, expect, it } from "vitest";
import { chapterBodyForReader, stripYamlFrontmatter } from "./mdx-frontmatter";

describe("stripYamlFrontmatter", () => {
  it("removes import-style lesson metadata", () => {
    const raw = `---
id: multi-vendor-marketplace-04-07
title: "4.7 — Quiz"
module: 4
lesson: 7
stepType: Check
---
# 4.7 — Quiz

Intro paragraph.
`;
    const { frontmatter, body } = stripYamlFrontmatter(raw);
    expect(frontmatter.id).toBe("multi-vendor-marketplace-04-07");
    expect(body.startsWith("# 4.7 — Quiz")).toBe(true);
    expect(chapterBodyForReader(raw)).not.toMatch(/^id:/m);
  });

  it("returns source unchanged when no frontmatter fence", () => {
    const raw = "# Hello\n\nProse.";
    expect(chapterBodyForReader(raw)).toBe(raw);
  });
});
