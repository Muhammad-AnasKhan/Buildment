import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import type { Code } from "mdast";
import { isDiagramKind, parseDiagram } from "../diagram/spec.js";

/**
 * Problems with ```flow and ```sequence fences in a chapter, with line numbers
 * counted from the top of the chapter so an author can jump straight to them.
 * Publishing and course checks refuse a chapter with any problem.
 */
export function collectDiagramProblems(source: string): string[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const problems: string[] = [];
  visit(tree, "code", (node: Code) => {
    if (!isDiagramKind(node.lang)) return;
    const result = parseDiagram(node.lang, node.value);
    if (result.ok) return;
    const fenceLine = node.position?.start.line ?? 0;
    const where = `The \`\`\`${node.lang} diagram on line ${fenceLine}`;
    for (const problem of result.problems) {
      const line = /^Line (\d+): ([\s\S]*)$/.exec(problem);
      problems.push(line ? `${where}, line ${fenceLine + Number(line[1])}: ${line[2]}` : `${where}: ${problem}`);
    }
  });
  // The fence is the one way to write a diagram, so every diagram gets these checks.
  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    if ((node as { name?: string | null }).name !== "Diagram") return;
    problems.push(`Line ${node.position?.start.line ?? 0}: write a diagram as a \`\`\`flow or \`\`\`sequence fence, not a <Diagram> tag.`);
  });
  return problems;
}
