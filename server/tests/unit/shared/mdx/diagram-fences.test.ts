import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { collectDiagramProblems } from "../../../../src/shared/mdx/diagram-fences.js";
import { remarkDiagram } from "../../../../src/shared/mdx/remark-diagram.js";

const GOOD = "Intro.\n\n```flow\ntitle: Chain\nactor You\nbox DNS\nYou -> DNS\n```\n\nAfter.\n";

describe("collectDiagramProblems", () => {
  it("accepts a valid fence and ignores other code", () => {
    expect(collectDiagramProblems(`${GOOD}\n\`\`\`ts\nconst a = 1 -> 2;\n\`\`\`\n`)).toEqual([]);
  });

  it("reports problems with chapter line numbers", () => {
    const source = "# Title\n\nText.\n\n```sequence\ntitle: Look up\nactor You\nbox DNS\nYou -> Nope\n```\n";
    expect(collectDiagramProblems(source)).toEqual([
      'The ```sequence diagram on line 5, line 9: "Nope" is not declared. Declare it first, for example "box Nope". Declared: You, DNS.',
    ]);
  });

  it("reports problems that have no line", () => {
    expect(collectDiagramProblems("```flow\nbox A\nbox B\nA -> B\n```")).toEqual([expect.stringMatching(/^The ```flow diagram on line 1: Add a title line/)]);
  });
});

describe("remarkDiagram", () => {
  it("turns a fence into a Diagram element with the spec as written", () => {
    const processor = unified().use(remarkParse).use(remarkMdx).use(remarkDiagram);
    const tree = processor.runSync(processor.parse(GOOD)) as unknown as { children: { type: string; name?: string; attributes?: { name: string; value: string }[] }[] };
    const diagram = tree.children.find((child) => child.type === "mdxJsxFlowElement");
    expect(diagram?.name).toBe("Diagram");
    expect(diagram?.attributes).toEqual([
      { type: "mdxJsxAttribute", name: "kind", value: "flow" },
      { type: "mdxJsxAttribute", name: "spec", value: "title: Chain\nactor You\nbox DNS\nYou -> DNS" },
    ]);
  });
});
