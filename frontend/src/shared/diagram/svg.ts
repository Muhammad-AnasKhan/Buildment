// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { describeDiagram } from "./describe";
import { drawScene, type SvgNode } from "./draw";
import { layoutDiagram } from "./layout";
import { parseDiagram, type DiagramKind, type DiagramParseResult } from "./spec";
import { wrapText } from "./text";

/**
 * A spec as a standalone SVG file, for places that cannot run the reader:
 * email, PDF, social images. Same parser, layout and drawing as the reader,
 * with the title drawn in and every arrow shown (no step is current).
 */

export type SvgExportOptions = { compact?: boolean };
export type SvgExportResult = { ok: true; svg: string } | { ok: false; problems: string[] };

export function diagramToSvg(kind: DiagramKind, source: string, options: SvgExportOptions = {}): SvgExportResult {
  const parsed: DiagramParseResult = parseDiagram(kind, source);
  if (!parsed.ok) return parsed;
  const scene = layoutDiagram(parsed.spec, options.compact ?? false);
  const titleLines = wrapText(parsed.spec.title, 16, scene.viewBox.w - 36, 3);
  const root = drawScene(scene, {}, { text: parsed.spec.title, lines: titleLines });
  const description = describeDiagram(parsed.spec);
  root.attrs.role = "img";
  root.children = [
    { tag: "title", attrs: {}, children: [parsed.spec.title] },
    { tag: "desc", attrs: {}, children: [description] },
    ...(root.children ?? []),
  ];
  return { ok: true, svg: `${toSvgString(root)}\n` };
}

const KEEP_CASE = new Set(["viewBox"]);

export function toSvgString(node: SvgNode | string): string {
  if (typeof node === "string") return escape(node);
  const attrs = Object.entries(node.attrs)
    .map(([key, value]) => ` ${KEEP_CASE.has(key) ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${escape(String(value))}"`)
    .join("");
  const children = (node.children ?? []).map(toSvgString).join("");
  return children ? `<${node.tag}${attrs}>${children}</${node.tag}>` : `<${node.tag}${attrs}/>`;
}

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
