import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { remarkChecklist } from "../../../../src/shared/mdx/remark-checklist.js";
import { remarkLearningLog } from "../../../../src/shared/mdx/remark-learning-log.js";

// Course fixtures live at the repo root, not inside this package.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");

function jsxElements(source: string): Array<{ name: string; attrs: Record<string, unknown> }> {
  const elements: Array<{ name: string; attrs: Record<string, unknown> }> = [];
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkChecklist)
    .use(remarkLearningLog)
    .parse(source);
  const processed = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkChecklist)
    .use(remarkLearningLog)
    .runSync(tree);
  visit(processed, "mdxJsxFlowElement", (node) => {
    const el = node as {
      name?: string | null;
      attributes?: Array<{ name: string; value?: unknown }>;
    };
    if (!el.name) return;
    const attrs: Record<string, unknown> = {};
    for (const attr of el.attributes ?? []) {
      if (attr.name === "questions" && attr.value && typeof attr.value === "object") {
        const expr = attr.value as { value?: string };
        attrs.questions = expr.value ? JSON.parse(expr.value) : attr.value;
      } else {
        attrs[attr.name] = attr.value;
      }
    }
    elements.push({ name: el.name, attrs });
  });
  return elements;
}

describe("remarkLearningLog on gate chapters", () => {
  it("transforms ## Learning log on 3-11 checklist", () => {
    const file = path.join(
      REPO_ROOT,
      "content/transformed/multi-vendor-marketplace/03-why-mongodb/03.11-checklist.mdx"
    );
    const body = fs.readFileSync(file, "utf8").replace(/^---[\s\S]*?---\n/, "");
    expect(jsxElements(body).some((e) => e.name === "LearningLog")).toBe(true);
  });

  it("uses default learning-log styling on gate checklist chapters", () => {
    for (const rel of [
      "content/transformed/multi-vendor-marketplace/03-why-mongodb/03.11-checklist.mdx",
      "content/transformed/multi-vendor-marketplace/04-config-and-database/04.17-checklist.mdx",
    ]) {
      const body = fs.readFileSync(path.join(REPO_ROOT, rel), "utf8").replace(/^---[\s\S]*?---\n/, "");
      const log = jsxElements(body).find((e) => e.name === "LearningLog");
      expect(log?.attrs.variant, rel).toBe("default");
    }
  });

  it("places learning log before All boxes ticked on 4-17", () => {
    const file = path.join(
      REPO_ROOT,
      "content/transformed/multi-vendor-marketplace/04-config-and-database/04.17-checklist.mdx"
    );
    const body = fs.readFileSync(file, "utf8").replace(/^---[\s\S]*?---\n/, "");
    expect(body).not.toMatch(/### Learning log/i);
    expect(body).toMatch(/## Learning log[\s\S]*## All boxes ticked/i);
    expect(body).not.toMatch(/BigWordAlert|InterestingRead|RealWorldEvent/);
  });
});
