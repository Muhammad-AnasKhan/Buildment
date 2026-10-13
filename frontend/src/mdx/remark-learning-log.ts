/**
 * Transforms "Learning log" headings + ordered question lists into <LearningLog /> JSX.
 */
import type { Heading, List, ListItem, Paragraph, PhrasingContent, Root } from "mdast";
import { visit } from "unist-util-visit";
import { slugify } from "@/lib/mdx-headings";

export type LearningLogQuestionData = {
  id: string;
  title: string;
  hint?: string;
};

function phrasingToMarkdown(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return node.value;
      if (node.type === "strong") {
        return `**${phrasingToMarkdown(node.children as PhrasingContent[])}**`;
      }
      if (node.type === "emphasis") {
        return `*${phrasingToMarkdown(node.children as PhrasingContent[])}*`;
      }
      if (node.type === "inlineCode") return `\`${node.value}\``;
      if ("children" in node && Array.isArray(node.children)) {
        return phrasingToMarkdown(node.children as PhrasingContent[]);
      }
      return "";
    })
    .join("");
}

function headingText(heading: Heading): string {
  return heading.children
    .map((c) => ("value" in c ? c.value : ""))
    .join("")
    .trim();
}

function listItemText(item: ListItem): string {
  for (const child of item.children) {
    if (child.type === "paragraph") {
      return phrasingToMarkdown(child.children as PhrasingContent[]).trim();
    }
  }
  return "";
}

function parseQuestion(raw: string, index: number): LearningLogQuestionData {
  const boldMatch = raw.match(/^\*\*([^*]+)\*\*:?\s*([\s\S]*)$/);
  if (boldMatch) {
    const title = boldMatch[1]!.trim();
    const hint = boldMatch[2]?.trim();
    return {
      id: `${slugify(title) || `question-${index}`}-${index}`,
      title,
      hint: hint || undefined,
    };
  }
  return {
    id: `${slugify(raw.slice(0, 48)) || `question-${index}`}-${index}`,
    title: raw,
  };
}

function isLearningLogHeading(title: string): boolean {
  return /learning log/i.test(title);
}

function normalizeLearningLogTitle(title: string): string {
  return title.replace(/^learning log\s*[—–-]?\s*(write now)?\s*/i, "").trim() || "Learning log";
}

function mdxLearningLogNode(options: {
  title: string;
  instruction?: string;
  questions: LearningLogQuestionData[];
  variant: "gate" | "default";
}) {
  const attributes: Record<string, unknown>[] = [
    {
      type: "mdxJsxAttribute",
      name: "title",
      value: options.title,
    },
    {
      type: "mdxJsxAttribute",
      name: "questions",
      value: {
        type: "mdxJsxAttributeValueExpression",
        value: JSON.stringify(options.questions),
        data: {
          estree: {
            type: "Program",
            sourceType: "module",
            body: [
              {
                type: "ExpressionStatement",
                expression: {
                  type: "Literal",
                  value: options.questions,
                  raw: JSON.stringify(options.questions),
                },
              },
            ],
          },
        },
      },
    },
    {
      type: "mdxJsxAttribute",
      name: "variant",
      value: options.variant,
    },
  ];

  if (options.instruction) {
    attributes.splice(1, 0, {
      type: "mdxJsxAttribute",
      name: "instruction",
      value: options.instruction,
    });
  }

  return {
    type: "mdxJsxFlowElement",
    name: "LearningLog",
    attributes,
    children: [],
  };
}

export function remarkLearningLog(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, "heading", (node: Heading, index, parent) => {
      if (!parent || index == null) return;

      const title = headingText(node);
      if (!isLearningLogHeading(title)) return;

      const headingDepth = node.depth;
      let cursor = index + 1;
      let instruction = "";
      let listIndex: number | null = null;

      while (cursor < parent.children.length) {
        const sibling = parent.children[cursor];
        if (sibling.type === "heading") {
          const next = sibling as Heading;
          if (next.depth <= headingDepth) break;
        }
        if (sibling.type === "list") {
          const list = sibling as List;
          if (list.ordered) {
            listIndex = cursor;
            break;
          }
        }
        if (sibling.type === "paragraph") {
          const paragraph = sibling as Paragraph;
          const text = phrasingToMarkdown(paragraph.children as PhrasingContent[]).trim();
          if (text) {
            instruction = instruction ? `${instruction} ${text}` : text;
          }
        }
        cursor += 1;
      }

      if (listIndex == null) return;

      const list = parent.children[listIndex] as List;
      const questions = list.children.map((item, itemIndex) =>
        parseQuestion(listItemText(item as ListItem), itemIndex)
      );
      if (questions.length === 0) return;

      const replacement = mdxLearningLogNode({
        title: normalizeLearningLogTitle(title),
        instruction: instruction || undefined,
        questions,
        variant: "default",
      });

      parent.children.splice(
        index,
        listIndex - index + 1,
        replacement as unknown as Heading
      );
    });
  };
}
