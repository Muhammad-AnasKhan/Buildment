/**
 * Transforms GFM task lists (- [ ] / - [x]) into interactive <Checklist /> JSX.
 */
import type { Heading, List, ListItem, PhrasingContent, Root } from "mdast";
import { visit } from "unist-util-visit";
import { slugify } from "@/lib/mdx-headings";

export type ChecklistItemData = {
  id: string;
  label: string;
  defaultChecked: boolean;
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

function listItemLabel(item: ListItem): string {
  for (const child of item.children) {
    if (child.type === "paragraph") {
      return phrasingToMarkdown(child.children as PhrasingContent[]).trim();
    }
  }
  return "";
}

function isTaskList(node: List): boolean {
  return (
    node.children.length > 0 &&
    node.children.every(
      (item): item is ListItem =>
        item.type === "listItem" && typeof item.checked === "boolean"
    )
  );
}

function previousHeadingTitle(
  siblings: Root["children"],
  index: number
): { title: string; depth: number } | undefined {
  for (let i = index - 1; i >= 0; i--) {
    const node = siblings[i];
    if (node.type === "heading") {
      const heading = node as Heading;
      const title = heading.children
        .map((c) => ("value" in c ? c.value : ""))
        .join("")
        .trim();
      return { title, depth: heading.depth };
    }
    if (node.type === "list" || node.type === "paragraph") continue;
    break;
  }
  return undefined;
}

function isUnderGateHeading(siblings: Root["children"], index: number): boolean {
  for (let i = index - 1; i >= 0; i--) {
    const node = siblings[i];
    if (node.type === "heading") {
      const heading = node as Heading;
      const title = heading.children
        .map((c) => ("value" in c ? c.value : ""))
        .join("")
        .trim();
      if (heading.depth <= 2) {
        return /checklist|gate|self-check|verify before|tick every/i.test(title);
      }
    }
  }
  return false;
}

function checklistVariant(
  underGate: boolean,
  section?: string
): "gate" | "section" | "inline" {
  if (underGate) return "gate";
  if (section) return "section";
  return "inline";
}

function mdxChecklistNode(options: {
  items: ChecklistItemData[];
  section?: string;
  variant: "gate" | "section" | "inline";
}) {
  const attributes: Record<string, unknown>[] = [
    {
      type: "mdxJsxAttribute",
      name: "items",
      value: {
        type: "mdxJsxAttributeValueExpression",
        value: JSON.stringify(options.items),
        data: {
          estree: {
            type: "Program",
            sourceType: "module",
            body: [
              {
                type: "ExpressionStatement",
                expression: {
                  type: "Literal",
                  value: options.items,
                  raw: JSON.stringify(options.items),
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

  if (options.section) {
    attributes.unshift({
      type: "mdxJsxAttribute",
      name: "section",
      value: options.section,
    });
  }

  return {
    type: "mdxJsxFlowElement",
    name: "Checklist",
    attributes,
    children: [],
  };
}

export function remarkChecklist(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, "list", (node: List, index, parent) => {
      if (!parent || index == null || !isTaskList(node)) return;

      const heading = previousHeadingTitle(parent.children, index);
      const section =
        heading && heading.depth === 3 ? heading.title : undefined;
      const underGate = isUnderGateHeading(parent.children, index);

      const items: ChecklistItemData[] = node.children.map((item, itemIndex) => {
        const label = listItemLabel(item as ListItem);
        const baseId = slugify(label) || `item-${itemIndex}`;
        return {
          id: `${baseId}-${itemIndex}`,
          label,
          defaultChecked: (item as ListItem).checked === true,
        };
      });

      const variant = checklistVariant(underGate, section);

      parent.children.splice(
        index,
        1,
        mdxChecklistNode({ items, section, variant }) as unknown as List
      );
    });
  };
}
