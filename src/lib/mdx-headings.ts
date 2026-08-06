import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";

export interface Heading {
  level: number;
  text: string;
  id: string;
}

/**
 * Extract headings (h1-h3) from MDX source and generate slugified IDs.
 * Used for the chapter TOC sidebar.
 */
export function extractHeadings(source: string): Heading[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const headings: Heading[] = [];

  visit(tree, "heading", (node: { depth: number; children: unknown[] }) => {
    if (node.depth > 3) return; // Only h1, h2, h3
    const text = extractText(node.children);
    const id = slugify(text);
    headings.push({ level: node.depth, text, id });
  });

  return headings;
}

function extractText(children: unknown[]): string {
  return children
    .map((child) => {
      if (child == null) return "";
      if (typeof child === "string") return child;
      if (typeof child === "object" && "value" in (child as Record<string, unknown>)) {
        return (child as { value: string }).value;
      }
      if (typeof child === "object" && "children" in (child as Record<string, unknown>)) {
        return extractText((child as { children: unknown[] }).children);
      }
      return "";
    })
    .join("");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
