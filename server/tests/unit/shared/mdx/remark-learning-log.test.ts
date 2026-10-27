import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { remarkChecklist } from "../../../../src/shared/mdx/remark-checklist.js";
import { remarkLearningLog } from "../../../../src/shared/mdx/remark-learning-log.js";
import { parseLesson } from "../../../../scripts/import-course.js";
import { COURSE_SOURCE_DIR } from "../../../../scripts/course-source.js";

// These checks read real gate chapters from the private course source. They only
// run when that checkout is present; the public platform checkout has no courses/.
const hasCourseSource = existsSync(COURSE_SOURCE_DIR);

function gateSource(moduleNum: number, moduleDir: string, fileName: string, lessonNum: number): string {
  return parseLesson(moduleNum, moduleDir, fileName, lessonNum, fileName.replace(/^\d+\.\d+-|\.md$/g, "")).source;
}

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
  it.skipIf(!hasCourseSource)("transforms ## Learning log on 3-11 checklist", () => {
    const body = gateSource(3, "03-why-mongodb", "03.11-checklist.md", 11);
    expect(jsxElements(body).some((e) => e.name === "LearningLog")).toBe(true);
  });

  it.skipIf(!hasCourseSource)("uses default learning-log styling on gate checklist chapters", () => {
    for (const { moduleNum, moduleDir, fileName, lessonNum } of [
      { moduleNum: 3, moduleDir: "03-why-mongodb", fileName: "03.11-checklist.md", lessonNum: 11 },
      { moduleNum: 4, moduleDir: "04-config-and-database", fileName: "04.17-checklist.md", lessonNum: 17 },
    ]) {
      const body = gateSource(moduleNum, moduleDir, fileName, lessonNum);
      const log = jsxElements(body).find((e) => e.name === "LearningLog");
      expect(log?.attrs.variant, fileName).toBe("default");
    }
  });

  it.skipIf(!hasCourseSource)("places learning log before All boxes ticked on 4-17", () => {
    const body = gateSource(4, "04-config-and-database", "04.17-checklist.md", 17);
    expect(body).not.toMatch(/### Learning log/i);
    expect(body).toMatch(/## Learning log[\s\S]*## All boxes ticked/i);
    expect(body).not.toMatch(/BigWordAlert|InterestingRead|RealWorldEvent/);
  });
});
