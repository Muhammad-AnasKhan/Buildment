// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { load as loadYaml } from "js-yaml";
import type { Code } from "mdast";
import { isLabSlug } from "../lab/slugs";

type JsxAttribute = { type: string; name?: string; value?: unknown };
type JsxElement = { name?: string | null; attributes?: JsxAttribute[]; children?: unknown[] };

export const PORTABLE_LAB_FAMILIES = ["hld", "net", "db"] as const;

/**
 * Problems with <Lab> tags and ```lab fences in a chapter: either the tag names
 * a registered slug in LAB_SLUGS, or a ```lab fence configures an HLD, networking,
 * or database lab from plain YAML/JSON data.
 */
export function collectLabProblems(source: string): string[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const problems: string[] = [];
  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as JsxElement;
    if (element.name !== "Lab") return;
    const specAttr = element.attributes?.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "spec");
    if (specAttr) {
      if ((element.children ?? []).length > 0) {
        problems.push("<Lab> takes no children. Write it as a self-closing tag.");
      }
      return;
    }
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

  visit(tree, "code", (node: Code) => {
    if (node.lang !== "lab") return;
    const line = node.position?.start.line ?? 0;
    const where = `The \`\`\`lab fence on line ${line}`;
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
    const raw = parsed as Record<string, unknown>;
    const obj =
      raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
        ? { ...raw, ...(raw.data as Record<string, unknown>) }
        : raw;

    if (typeof obj.family !== "string" || !(PORTABLE_LAB_FAMILIES as readonly string[]).includes(obj.family)) {
      problems.push(`${where}: "family" must be one of ${PORTABLE_LAB_FAMILIES.join(", ")}.`);
      return;
    }
    if (typeof obj.title !== "string" || !obj.title.trim()) {
      problems.push(`${where}: missing non-empty "title".`);
    }
    if (typeof obj.purpose !== "string" || !obj.purpose.trim()) {
      problems.push(`${where}: missing non-empty "purpose".`);
    }
    if (typeof obj.limits !== "string" || obj.limits.trim().length <= 20) {
      problems.push(`${where}: "limits" must be longer than 20 characters.`);
    }
    if (obj.family === "hld") {
      if (!Array.isArray(obj.allowedComponents) || obj.allowedComponents.length === 0) {
        problems.push(`${where}: an hld lab requires a non-empty "allowedComponents" array.`);
      }
      if (!Array.isArray(obj.levels) || obj.levels.length === 0) {
        problems.push(`${where}: an hld lab requires at least one level in "levels".`);
      }
    } else if (obj.family === "net") {
      if (typeof obj.mode !== "string" || !["explore", "fault", "plan", "build"].includes(obj.mode)) {
        problems.push(`${where}: a net lab requires "mode" to be explore, fault, plan, or build.`);
      }
    } else if (obj.family === "db") {
      if (typeof obj.startingDbml !== "string" || !obj.startingDbml.trim()) {
        problems.push(`${where}: a db lab requires "startingDbml".`);
      }
      if (typeof obj.query !== "string" || !obj.query.trim()) {
        problems.push(`${where}: a db lab requires "query".`);
      }
    }
  });

  return problems;
}
