// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
/**
 * Remark plugin that turns ```flow and ```sequence fences into
 * <Diagram kind="flow" spec="..." /> nodes in the MDX tree, as remark-mermaid
 * does for ```mermaid. The fence body is the spec, passed through unchanged;
 * the component parses it. See docs/diagram-components-plan.md.
 *
 * It also takes the ```mermaid fences that convert exactly to a spec
 * (diagram/from-mermaid), so existing chapters get the branded diagram with no
 * edit. It must run before remark-mermaid, which draws whatever is left.
 */
import type { Code, Heading, Parent, Root } from "mdast";
import { visit } from "unist-util-visit";
import { isDiagramKind } from "../diagram/spec";
import { mermaidToDiagram } from "../diagram/from-mermaid";

function diagramNode(kind: string, spec: string): Code {
  return {
    type: "mdxJsxFlowElement",
    name: "Diagram",
    attributes: [
      { type: "mdxJsxAttribute", name: "kind", value: kind },
      { type: "mdxJsxAttribute", name: "spec", value: spec },
    ],
    children: [],
  } as unknown as Code;
}

function text(node: unknown): string {
  const n = node as { value?: unknown; children?: unknown[] };
  if (typeof n.value === "string") return n.value;
  return (n.children ?? []).map(text).join("");
}

/** The closest heading above the fence, which names a converted diagram. */
function headingBefore(parent: Parent, index: number): string | undefined {
  for (let i = index - 1; i >= 0; i--) {
    const node = parent.children[i];
    if (node.type === "heading") return text(node as Heading).trim() || undefined;
  }
  return undefined;
}

export function remarkDiagram(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (!parent || index == null) return;
      if (isDiagramKind(node.lang)) {
        parent.children.splice(index, 1, diagramNode(node.lang, node.value));
        return;
      }
      if (node.lang !== "mermaid") return;
      const converted = mermaidToDiagram(node.value, headingBefore(parent, index));
      if (converted) parent.children.splice(index, 1, diagramNode(converted.kind, converted.source));
    });
  };
}
