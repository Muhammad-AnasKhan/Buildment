import type { BlockContent, DefinitionContent, PhrasingContent } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";

const blockTypes = new Set([
  "paragraph", "heading", "blockquote", "list", "code", "html",
  "thematicBreak", "definition", "table", "footnoteDefinition",
  "mdxJsxFlowElement", "mdxFlowExpression", "mdxjsEsm",
]);

// Lexical's root accepts blocks only. Preserve inline runs in paragraphs,
// including legacy flow JSX whose children were stored as bare text.
export function nestedBlockContent(node: MdxJsxFlowElement | MdxJsxTextElement) {
  if (node.type === "mdxJsxTextElement") return node.children;
  if (node.name === "FaqItem" && node.children.length === 0) {
    const answer = node.attributes.find(attr => attr.type === "mdxJsxAttribute" && attr.name === "answer");
    if (answer?.type === "mdxJsxAttribute" && typeof answer.value === "string" && answer.value) {
      return [{ type: "paragraph" as const, children: [{ type: "text" as const, value: answer.value }] }];
    }
  }
  const result: Array<BlockContent | DefinitionContent> = [];
  let inline: PhrasingContent[] = [];
  const flush = () => {
    if (inline.length) result.push({ type: "paragraph", children: inline });
    inline = [];
  };
  for (const child of node.children) {
    if (blockTypes.has(child.type)) {
      flush();
      result.push(child as BlockContent | DefinitionContent);
    } else {
      inline.push(child as PhrasingContent);
    }
  }
  flush();
  return result;
}

export function updateNestedBlockContent<T extends MdxJsxFlowElement | MdxJsxTextElement>(node: T, children: T["children"]): T {
  return {
    ...node,
    children,
    attributes: node.name === "FaqItem"
      ? node.attributes.filter(attr => attr.type !== "mdxJsxAttribute" || attr.name !== "answer")
      : node.attributes,
  };
}
