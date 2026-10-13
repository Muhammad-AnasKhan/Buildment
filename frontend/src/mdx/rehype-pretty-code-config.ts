import { visit } from "unist-util-visit";
import rehypePrettyCode from "rehype-pretty-code";
import type { Pluggable } from "unified";

type HastElement = {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
};

/**
 * rehype-pretty-code marks figures with `data-rehype-pretty-code-figure=""`.
 * An empty string is easy to drop or treat as missing in React, so stamp a
 * class the reader CSS can rely on.
 */
function rehypeShikiFigureClass() {
  return (tree: { type: string }) => {
    visit(tree, "element", (node: HastElement) => {
      if (node.tagName !== "figure") return;
      if (!Object.hasOwn(node.properties ?? {}, "data-rehype-pretty-code-figure")) return;
      const existing = node.properties.className;
      const classes = Array.isArray(existing)
        ? existing.map(String)
        : existing
          ? [String(existing)]
          : [];
      if (!classes.includes("shiki-figure")) classes.push("shiki-figure");
      if (!classes.includes("not-prose")) classes.push("not-prose");
      node.properties.className = classes;
    });
  };
}

/** Shared rehype-pretty-code options for reader MDX (light + dark Shiki themes). */
export const rehypePrettyCodePlugins: Pluggable[] = [
  [
    rehypePrettyCode,
    {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      // Only unlabeled fences. A string default also highlights every inline
      // `code` span and turns it into a full-width block.
      defaultLang: { block: "plaintext", inline: "" },
      bypassInlineCode: true,
      keepBackground: false,
      grid: true,
    },
  ],
  rehypeShikiFigureClass,
];
