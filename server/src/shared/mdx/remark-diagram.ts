/**
 * Remark plugin that turns ```flow and ```sequence fences into
 * <Diagram kind="flow" spec="..." /> nodes in the MDX tree, as remark-mermaid
 * does for ```mermaid. The fence body is the spec, passed through unchanged;
 * the component parses it. See docs/diagram-components-plan.md.
 */
import type { Code, Root } from "mdast";
import { visit } from "unist-util-visit";
import { isDiagramKind } from "../diagram/spec.js";

export function remarkDiagram(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (!isDiagramKind(node.lang) || !parent || index == null) return;
      const mdxNode: Record<string, unknown> = {
        type: "mdxJsxFlowElement",
        name: "Diagram",
        attributes: [
          { type: "mdxJsxAttribute", name: "kind", value: node.lang },
          { type: "mdxJsxAttribute", name: "spec", value: node.value },
        ],
        children: [],
      };
      parent.children.splice(index, 1, mdxNode as unknown as Code);
    });
  };
}
