import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { isLabSlug } from "../lab/slugs.js";

type JsxAttribute = { type: string; name?: string; value?: unknown };
type JsxElement = { name?: string | null; attributes?: JsxAttribute[]; children?: unknown[] };

/**
 * Problems with <Lab> tags in a chapter: the slug must be a plain string that
 * names a registered lab. MDX cannot reach an arbitrary component through this
 * tag, only the closed set in LAB_SLUGS.
 */
export function collectLabProblems(source: string): string[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const problems: string[] = [];
  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as JsxElement;
    if (element.name !== "Lab") return;
    const slugAttr = element.attributes?.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "slug");
    if (!slugAttr) {
      problems.push('<Lab> needs a slug, for example slug="hld-m2-utilisation-knee".');
      return;
    }
    if (typeof slugAttr.value !== "string") {
      problems.push("<Lab> slug must be a plain string, not an expression.");
      return;
    }
    if (!isLabSlug(slugAttr.value)) {
      problems.push(`<Lab slug="${slugAttr.value}"> is not a registered lab.`);
    }
    if ((element.children ?? []).length > 0) {
      problems.push(`<Lab slug="${slugAttr.value}"> takes no children. Write it as a self-closing tag.`);
    }
  });
  return problems;
}
