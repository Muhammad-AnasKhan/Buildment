import { describe, expect, it } from "vitest";
import {
  BLOCK_TAG_NAMES,
  collectUnknownComponents,
  diffBlocks,
  extractBlocksFromSource,
} from "./extract";
import { restoreInteractiveBlockTags } from "./restore-block-tags";

// Scaffolding for docs/02-content-authoring.mdx "Block extraction and the
// sync problem": id is the join key, new ids create, missing ids archive,
// changed content bumps the version.

const QUIZ_A = '<Quiz id="01J8AAA" />';
const OPEN_Q = '<OpenQuestion id="01J8CCC" />';

describe("extractBlocksFromSource", () => {
  it("extracts blocks with explicit ids in document order", () => {
    const source = `# Intro

Some prose.

${QUIZ_A}

More prose.

${OPEN_Q}
`;
    const blocks = extractBlocksFromSource(source);
    expect(blocks.map((b) => b.id)).toEqual(["01J8AAA", "01J8CCC"]);
    expect(blocks.map((b) => b.order)).toEqual([0, 1]);
    expect(blocks[0]!.blockType).toBe("QUIZ");
    expect(blocks[1]!.blockType).toBe("OPEN_QUESTION");
    expect(blocks[0]!.tagName).toBe("Quiz");
  });

  it("ignores JSX elements without an id and unknown tags stay tag-typed", () => {
    const source = `<Callout title="hi">note</Callout>\n\n${QUIZ_A}`;
    const blocks = extractBlocksFromSource(source);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.id).toBe("01J8AAA");
  });

  it("extracts escaped placeholders after restoreInteractiveBlockTags", () => {
    // The import pipeline stores blocks as HTML-escaped placeholders; extract
    // must see through the restored form so re-publishing imported chapters
    // never archives their blocks.
    const stored = `Intro prose.\n\n&lt;Quiz id="01J8AAA" />\n\n&lt;OpenQuestion id="01J8CCC" />`;
    const blocks = extractBlocksFromSource(restoreInteractiveBlockTags(stored));
    expect(blocks.map((b) => b.id)).toEqual(["01J8AAA", "01J8CCC"]);
    expect(blocks.map((b) => b.blockType)).toEqual(["QUIZ", "OPEN_QUESTION"]);
  });

  it("covers every block tag the schema declares", () => {
    expect(Object.values(BLOCK_TAG_NAMES)).toEqual(
      expect.arrayContaining(["QUIZ", "TEST", "MUST_READ", "OPEN_QUESTION", "CODE"])
    );
  });
});

describe("sourceHash", () => {
  it("is stable when a block moves elsewhere in the document", () => {
    const before = extractBlocksFromSource(`${QUIZ_A}\n\nTail text.`);
    const after = extractBlocksFromSource(`Head text.\n\n${QUIZ_A}`);
    expect(before[0]!.sourceHash).toBe(after[0]!.sourceHash);
  });

  it("changes when the block content is edited", () => {
    const before = extractBlocksFromSource('<Quiz id="01J8AAA" />');
    const edited = extractBlocksFromSource(
      '<Quiz id="01J8AAA">\n\nChanged question prose.\n\n</Quiz>'
    );
    expect(before[0]!.sourceHash).not.toBe(edited[0]!.sourceHash);
  });
});

describe("diffBlocks", () => {
  const extracted = extractBlocksFromSource(`${QUIZ_A}\n\n${OPEN_Q}`);

  it("creates blocks the DB has not seen", () => {
    const diff = diffBlocks(extracted, []);
    expect(diff.create.map((b) => b.id)).toEqual(["01J8AAA", "01J8CCC"]);
    expect(diff.archiveIds).toEqual([]);
    expect(diff.bump).toEqual([]);
    expect(diff.backfill).toEqual([]);
  });

  it("archives DB blocks that disappeared from the source", () => {
    const diff = diffBlocks([], [
      { id: "01J8AAA", sourceHash: "x" },
      { id: "01J8ZZZ", sourceHash: "y" },
    ]);
    expect(diff.create).toEqual([]);
    expect(diff.archiveIds).toEqual(["01J8AAA", "01J8ZZZ"]);
  });

  it("bumps the version when content changed", () => {
    const staleHash = "not-the-current-hash";
    const current = new Map(extracted.map((b) => [b.id, b.sourceHash]));
    const diff = diffBlocks(extracted, [
      { id: "01J8AAA", sourceHash: staleHash },
      { id: "01J8CCC", sourceHash: current.get("01J8CCC")! },
    ]);
    expect(diff.bump).toEqual([{ id: "01J8AAA", sourceHash: current.get("01J8AAA")! }]);
    expect(diff.backfill).toEqual([]);
    expect(diff.archiveIds).toEqual([]);
  });

  it("backfills a missing stored hash without bumping the version", () => {
    const current = new Map(extracted.map((b) => [b.id, b.sourceHash]));
    const diff = diffBlocks(extracted, [{ id: "01J8AAA", sourceHash: null }]);
    expect(diff.bump).toEqual([]);
    expect(diff.backfill).toEqual([
      { id: "01J8AAA", sourceHash: current.get("01J8AAA")! },
    ]);
  });
});

describe("collectUnknownComponents", () => {
  const allowlist = new Set(["Quiz", "OpenQuestion", "FaqGroup", "FaqItem"]);

  it("flags uppercase components outside the allowlist", () => {
    const source = `${QUIZ_A}\n\n<Script src="evil.js" />\n\n<Widget />`;
    expect(collectUnknownComponents(source, allowlist)).toEqual(
      expect.arrayContaining(["Script", "Widget"])
    );
  });

  it("allows known components and lowercase HTML tags", () => {
    const source = `${QUIZ_A}\n\n<FaqGroup>\n\nbody\n\n</FaqGroup>\n\n<div>plain</div>`;
    expect(collectUnknownComponents(source, allowlist)).toEqual([]);
  });
});
