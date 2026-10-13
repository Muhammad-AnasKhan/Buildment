/**
 * Remark plugin that transforms fenced code blocks with language "mermaid"
 * into JSX <MermaidDiagram chart="..." /> nodes in the MDX AST.
 *
 * This runs during MDX compilation (server-side) so that the MermaidDiagram
 * client component is only instantiated when needed.
 */
import type { Root, Code } from "mdast";
import { visit } from "unist-util-visit";

export function remarkMermaid(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid") return;
      if (!parent || index == null) return;

      const chartSource = node.value;

      // Replace the code node with an MDX JSX flow element
      const mdxNode: Record<string, unknown> = {
        type: "mdxJsxFlowElement",
        name: "MermaidDiagram",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "chart",
            value: chartSource,
          },
        ],
        children: [],
      };

      parent.children.splice(index, 1, mdxNode as unknown as Code);
    });
  };
}
