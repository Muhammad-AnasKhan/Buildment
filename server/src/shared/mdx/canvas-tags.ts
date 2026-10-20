import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { isCanvasSlug } from "../canvas/slugs.js";

type JsxAttribute = { type: string; name?: string; value?: unknown };
type JsxElement = { name?: string | null; attributes?: JsxAttribute[]; children?: unknown[] };

/**
 * Problems with <InteractiveCanvas> tags in a chapter: the slug must be a plain
 * string that names a registered canvas. MDX cannot reach an arbitrary
 * component through this tag, only the closed set in CANVAS_SLUGS.
 */
export function collectCanvasProblems(source: string): string[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const problems: string[] = [];
  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as JsxElement;
    if (element.name !== "InteractiveCanvas") return;
    const slugAttr = element.attributes?.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "slug");
    if (!slugAttr) {
      problems.push("<InteractiveCanvas> needs a slug, for example slug=\"weighted-matrix-two-offers\".");
      return;
    }
    if (typeof slugAttr.value !== "string") {
      problems.push("<InteractiveCanvas> slug must be a plain string, not an expression.");
      return;
    }
    if (!isCanvasSlug(slugAttr.value)) {
      problems.push(`<InteractiveCanvas slug="${slugAttr.value}"> is not a registered canvas.`);
    }
    if ((element.children ?? []).length > 0) {
      problems.push(`<InteractiveCanvas slug="${slugAttr.value}"> takes no children. Write it as a self-closing tag.`);
    }
  });
  return problems;
}
