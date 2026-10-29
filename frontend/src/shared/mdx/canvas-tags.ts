// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { load as loadYaml } from "js-yaml";
import type { Code } from "mdast";
import { isCanvasSlug } from "../canvas/slugs";

type JsxAttribute = { type: string; name?: string; value?: unknown };
type JsxElement = { name?: string | null; attributes?: JsxAttribute[]; children?: unknown[] };

export const PORTABLE_CANVAS_RENDERER_NAMES = [
  "net-step",
  "replay",
  "sequence",
  "state-machine",
  "factor",
  "scene",
  "slider",
  "diagram",
  "addr",
  "packet",
  "sorter",
  "block-map",
  "context-picker",
  "flip-deck",
  "commit-story",
  "phrase-fixer",
  "budget-stack",
  "slot-card",
] as const;

export function isPortableCanvasRendererName(value: unknown): boolean {
  return typeof value === "string" && (PORTABLE_CANVAS_RENDERER_NAMES as readonly string[]).includes(value);
}

/**
 * Problems with <InteractiveCanvas> tags and ```canvas fences in a chapter.
 * Either a tag names a registered slug in CANVAS_SLUGS, or a ```canvas fence
 * configures a known catalog renderer with plain YAML/JSON data.
 */
export function collectCanvasProblems(source: string): string[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const problems: string[] = [];
  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as JsxElement;
    if (element.name !== "InteractiveCanvas") return;
    const rendererAttr = element.attributes?.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "renderer");
    const dataAttr = element.attributes?.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "data");
    if (rendererAttr && dataAttr) {
      if (typeof rendererAttr.value !== "string" || !isPortableCanvasRendererName(rendererAttr.value)) {
        problems.push(`<InteractiveCanvas renderer="${String(rendererAttr.value ?? "")}"> is not a supported portable canvas renderer.`);
      }
      if ((element.children ?? []).length > 0) {
        problems.push(`<InteractiveCanvas renderer="${String(rendererAttr.value ?? "")}"> takes no children. Write it as a self-closing tag.`);
      }
      return;
    }
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

  visit(tree, "code", (node: Code) => {
    if (node.lang !== "canvas") return;
    const line = node.position?.start.line ?? 0;
    const where = `The \`\`\`canvas fence on line ${line}`;
    let parsed: unknown;
    try {
      parsed = loadYaml(node.value);
    } catch (err) {
      problems.push(`${where}: invalid YAML (${err instanceof Error ? err.message : String(err)}).`);
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      problems.push(`${where}: must be a YAML/JSON object.`);
      return;
    }
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.renderer !== "string" || !obj.renderer.trim()) {
      problems.push(`${where}: missing "renderer" field.`);
      return;
    }
    if (!isPortableCanvasRendererName(obj.renderer)) {
      problems.push(`${where}: unknown renderer "${obj.renderer}". Supported renderers: ${PORTABLE_CANVAS_RENDERER_NAMES.join(", ")}.`);
      return;
    }
    if (obj.version !== undefined && (typeof obj.version !== "number" || !Number.isInteger(obj.version) || obj.version < 1)) {
      problems.push(`${where}: "version" must be a positive integer.`);
    }
    const payload =
      obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)
        ? { ...obj, ...(obj.data as Record<string, unknown>) }
        : obj;
    if (obj.renderer !== "diagram") {
      if (typeof payload.title !== "string" || !payload.title.trim()) {
        problems.push(`${where}: missing non-empty "title".`);
      }
      if (typeof payload.limits !== "string" || !payload.limits.trim()) {
        problems.push(`${where}: missing non-empty "limits".`);
      }
    }
  });

  return problems;
}
