// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { endDirection, LINE_HEIGHT, pathPoint, type Point, type Scene, type SceneLabel, type SceneNode } from "./layout";

/**
 * Turns a scene into a plain element tree. The reader maps it to React
 * elements and the export writes it as SVG text, so both draw the same
 * picture. Colours are the Edorax brand values, fixed in light and dark mode,
 * because the diagram is a branded panel like an image. Attribute names are
 * React style (camelCase); `toSvgString` converts them.
 */

export const BRAND = {
  ink: "#0A0F2C",
  cobalt: "#2434E0",
  yellow: "#FFC933",
  tint: "#E8EBFF",
  paper: "#F6F7FB",
  white: "#FFFFFF",
  muted: "#46507A",
} as const;

export const DIAGRAM_FONT = "var(--font-dm-sans), 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

export type SvgNode = { tag: string; key?: string; attrs: Record<string, string | number>; children?: (SvgNode | string)[] };

export type DrawState = {
  /** The arrow of the current step, drawn in cobalt. */
  activeEdge?: number | null;
  /** Arrows not reached yet, drawn faint. */
  fadedEdges?: ReadonlySet<number>;
  /** The part the packet is at, ringed in cobalt. */
  activeNode?: string | null;
  /** Where to draw the yellow packet, if anywhere. */
  packet?: Point | null;
  /** Add a 44px invisible target around the packet for dragging. */
  packetHandle?: boolean;
};

const el = (tag: string, attrs: SvgNode["attrs"], children?: SvgNode["children"], key?: string): SvgNode => ({ tag, attrs, children, key });

function text(label: SceneLabel, fill: string, weight: number, key: string, halo = false): SvgNode {
  const lh = label.size * LINE_HEIGHT;
  const halos: SvgNode["attrs"] = halo ? { stroke: BRAND.tint, strokeWidth: 5, strokeLinejoin: "round", paintOrder: "stroke" } : {};
  return el(
    "text",
    { x: r(label.x), y: r(label.y), textAnchor: label.anchor, fontSize: label.size, fontWeight: weight, fill, ...halos },
    label.lines.map((line, i) => el("tspan", { x: r(label.x), dy: i === 0 ? 0 : r(lh) }, [line], `${key}-${i}`)),
    key,
  );
}

function shape(node: SceneNode): SvgNode[] {
  const s = node.shape;
  if (s.type === "circle") return [el("circle", { cx: r(s.cx), cy: r(s.cy), r: s.r, fill: BRAND.cobalt }, undefined, `${node.id}-shape`)];
  const frame = { fill: BRAND.white, stroke: BRAND.ink, strokeWidth: 3 };
  if (node.kind === "end") return [el("rect", { x: r(s.x), y: r(s.y), width: r(s.w), height: r(s.h), fill: BRAND.ink }, undefined, `${node.id}-shape`)];
  if (node.kind === "external") return [el("rect", { x: r(s.x), y: r(s.y), width: r(s.w), height: r(s.h), ...frame, strokeDasharray: "8 5" }, undefined, `${node.id}-shape`)];
  if (node.kind === "store") {
    const ry = 6, rx = s.w / 2, x2 = s.x + s.w, top = s.y + ry, bottom = s.y + s.h - ry;
    const body = `M${r(s.x)} ${r(top)} A${r(rx)} ${ry} 0 0 1 ${r(x2)} ${r(top)} V${r(bottom)} A${r(rx)} ${ry} 0 0 1 ${r(s.x)} ${r(bottom)} Z`;
    const lip = `M${r(s.x)} ${r(top)} A${r(rx)} ${ry} 0 0 0 ${r(x2)} ${r(top)}`;
    return [
      el("path", { d: body, ...frame }, undefined, `${node.id}-shape`),
      el("path", { d: lip, fill: "none", stroke: BRAND.ink, strokeWidth: 3 }, undefined, `${node.id}-lip`),
    ];
  }
  return [el("rect", { x: r(s.x), y: r(s.y), width: r(s.w), height: r(s.h), ...frame }, undefined, `${node.id}-shape`)];
}

function ring(node: SceneNode): SvgNode {
  const s = node.shape;
  const attrs = { fill: "none", stroke: BRAND.cobalt, strokeWidth: 3 };
  if (s.type === "circle") return el("circle", { cx: r(s.cx), cy: r(s.cy), r: s.r + 6, ...attrs }, undefined, `${node.id}-ring`);
  return el("rect", { x: r(s.x - 6), y: r(s.y - 6), width: r(s.w + 12), height: r(s.h + 12), ...attrs }, undefined, `${node.id}-ring`);
}

export function drawScene(scene: Scene, state: DrawState = {}, title?: { text: string; lines: string[] }): SvgNode {
  const { x, y, w } = scene.viewBox;
  let { h } = scene.viewBox;
  let top = y;
  const children: SvgNode[] = [];
  // A title band is only drawn for exported files; the reader shows the title as HTML.
  if (title) {
    const band = title.lines.length * 20 + 14;
    top = y - band;
    h += band;
  }
  children.push(el("rect", { x, y: top, width: w, height: h, fill: BRAND.tint }, undefined, "panel"));
  if (title) {
    children.push(text({ lines: title.lines, x: x + 18, y: top + 28, anchor: "start", size: 16 }, BRAND.ink, 700, "title"));
  }

  for (const [i, line] of scene.lifelines.entries()) {
    children.push(el("line", { x1: r(line.x), y1: r(line.y1), x2: r(line.x), y2: r(line.y2), stroke: BRAND.muted, strokeWidth: 2, strokeDasharray: "2 6", strokeLinecap: "round" }, undefined, `life-${i}`));
  }

  for (const edge of scene.edges) {
    const on = state.activeEdge === edge.index;
    const faded = state.fadedEdges?.has(edge.index) ?? false;
    const colour = on ? BRAND.cobalt : BRAND.ink;
    const p = edge.path;
    const dir = endDirection(p);
    // A plain line runs to the shape; an arrow stops where its head starts.
    const base = edge.head ? { x: p.end.x - dir.x * 9, y: p.end.y - dir.y * 9 } : p.end;
    const d = p.control
      ? `M${r(p.start.x)} ${r(p.start.y)} Q${r(p.control.x)} ${r(p.control.y)} ${r(base.x)} ${r(base.y)}`
      : `M${r(p.start.x)} ${r(p.start.y)} L${r(base.x)} ${r(base.y)}`;
    const wing = { x: -dir.y * 6, y: dir.x * 6 };
    const head = `M${r(p.end.x)} ${r(p.end.y)} L${r(base.x - dir.x * 2 + wing.x)} ${r(base.y - dir.y * 2 + wing.y)} L${r(base.x - dir.x * 2 - wing.x)} ${r(base.y - dir.y * 2 - wing.y)} Z`;
    const parts: SvgNode[] = [
      el("path", { d, fill: "none", stroke: colour, strokeWidth: on ? 4 : 3, ...(edge.dashed ? { strokeDasharray: "7 6" } : {}) }, undefined, `edge-${edge.index}-line`),
    ];
    if (edge.head) parts.push(el("path", { d: head, fill: colour }, undefined, `edge-${edge.index}-head`));
    if (edge.label) parts.push(text(edge.label, on ? BRAND.cobalt : BRAND.ink, on ? 700 : 600, `edge-${edge.index}-label`, true));
    if (edge.badge) {
      parts.push(el("circle", { cx: r(edge.badge.x), cy: r(edge.badge.y), r: 11, fill: on ? BRAND.cobalt : BRAND.white, stroke: on ? BRAND.cobalt : BRAND.ink, strokeWidth: 2 }, undefined, `edge-${edge.index}-badge`));
      parts.push(el("text", { x: r(edge.badge.x), y: r(edge.badge.y + 4.5), textAnchor: "middle", fontSize: 12, fontWeight: 700, fill: on ? BRAND.paper : BRAND.ink }, [String(edge.badge.n)], `edge-${edge.index}-n`));
    }
    children.push(el("g", faded ? { opacity: 0.25 } : {}, parts, `edge-${edge.index}`));
  }

  for (const node of scene.nodes) {
    const parts = shape(node);
    if (state.activeNode === node.id) parts.unshift(ring(node));
    const light = node.labelInside && (node.kind === "actor" || node.kind === "end");
    parts.push(text(node.label, light ? BRAND.paper : BRAND.ink, 700, `${node.id}-label`));
    children.push(el("g", {}, parts, `node-${node.id}`));
  }

  if (state.packet) {
    const packet: SvgNode[] = [];
    if (state.packetHandle) packet.push(el("circle", { cx: r(state.packet.x), cy: r(state.packet.y), r: 22, fill: "transparent" }, undefined, "packet-hit"));
    packet.push(el("circle", { cx: r(state.packet.x), cy: r(state.packet.y), r: 9, fill: BRAND.yellow, stroke: BRAND.ink, strokeWidth: 2.5 }, undefined, "packet-dot"));
    children.push(el("g", {}, packet, "packet"));
  }

  return el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `${x} ${top} ${w} ${h}`, width: w, height: h, style: `font-family: ${DIAGRAM_FONT}` }, children, "svg");
}

/** The packet's position `t` hops along a flow's packet path (0 = start, hops.length = end). */
export function packetPoint(scene: Scene, hops: { edge: number; reversed: boolean }[], t: number): Point | null {
  if (!hops.length) return null;
  const clamped = Math.max(0, Math.min(hops.length, t));
  const i = Math.min(hops.length - 1, Math.floor(clamped));
  const f = clamped - i;
  const hop = hops[i];
  const path = scene.edges[hop.edge].path;
  return pathPoint(path, hop.reversed ? 1 - f : f);
}

function r(n: number): number {
  return Math.round(n * 10) / 10;
}
