import { describe, expect, it } from "vitest";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { nestedBlockContent, updateNestedBlockContent } from "../../../../../src/components/teach/editor/nested-block-content";

describe("nested editor content", () => {
  it("opens legacy FAQ answers as blocks and removes the old field on edit", () => {
    const node: MdxJsxFlowElement = { type: "mdxJsxFlowElement", name: "FaqItem", attributes: [
      { type: "mdxJsxAttribute", name: "question", value: "Why?" },
      { type: "mdxJsxAttribute", name: "answer", value: "Because." },
    ], children: [] };
    expect(nestedBlockContent(node)).toEqual([{ type: "paragraph", children: [{ type: "text", value: "Because." }] }]);
    const updated = updateNestedBlockContent(node, [{ type: "paragraph", children: [{ type: "text", value: "Edited answer" }] }]);
    expect(updated.attributes).toEqual([node.attributes[0]]);
    expect(nestedBlockContent(updated)).toEqual(updated.children);
    expect(nestedBlockContent(updateNestedBlockContent(node, []))).toEqual([]);
  });

  it("prefers existing FAQ blocks over a legacy answer attribute", () => {
    const node: MdxJsxFlowElement = { type: "mdxJsxFlowElement", name: "FaqItem", attributes: [{ type: "mdxJsxAttribute", name: "answer", value: "Old" }], children: [{ type: "paragraph", children: [{ type: "text", value: "Actual answer" }] }] };
    expect(nestedBlockContent(node)).toEqual(node.children);
  });
  it("leaves inline JSX children for the inline editor to wrap", () => {
    const node: MdxJsxTextElement = { type: "mdxJsxTextElement", name: "GlossaryTerm", attributes: [], children: [{ type: "text", value: "API" }] };
    expect(nestedBlockContent(node)).toBe(node.children);
  });

  it("wraps bare inline runs without losing formatting or block order", () => {
    // Deliberately malformed legacy data: inline nodes at flow level.
    const node = {
      type: "mdxJsxFlowElement", name: "Callout", attributes: [], children: [
        { type: "text", value: "Before " },
        { type: "strong", children: [{ type: "text", value: "important" }] },
        { type: "paragraph", children: [{ type: "text", value: "Middle" }] },
        { type: "text", value: "After" },
      ],
    } as unknown as MdxJsxFlowElement;
    expect(nestedBlockContent(node)).toEqual([
      { type: "paragraph", children: node.children.slice(0, 2) },
      node.children[2],
      { type: "paragraph", children: [node.children[3]] },
    ]);
    expect(node.children[0].type).toBe("text");
  });

  it("preserves nested blocks and allows empty containers", () => {
    const node: MdxJsxFlowElement = { type: "mdxJsxFlowElement", name: "Steps", attributes: [], children: [] };
    expect(nestedBlockContent(node)).toEqual([]);
    node.children.push({ type: "mdxJsxFlowElement", name: "Step", attributes: [], children: [] });
    expect(nestedBlockContent(node)).toEqual(node.children);
  });
});
