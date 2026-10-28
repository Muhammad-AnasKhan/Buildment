import type { DiagramNode, DiagramSpec, NodeKind } from "./spec.js";
import { linesWidth, textWidth, wrapText } from "./text.js";

/**
 * Lays a parsed spec out as a scene: plain shapes and text positions in SVG
 * units. The reader and the SVG export both draw this scene, so they match.
 * `compact` is the phone layout: a flow runs top to bottom and a sequence
 * shows numbers on its arrows, with the labels listed under the picture.
 */

export type Point = { x: number; y: number };
export type SceneLabel = { lines: string[]; x: number; y: number; anchor: "start" | "middle" | "end"; size: number };
export type SceneShape =
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "rect"; x: number; y: number; w: number; h: number }
  /** A decision, drawn as a diamond whose points touch the edges of this box. */
  | { type: "diamond"; x: number; y: number; w: number; h: number };
export type SceneNode = { id: string; kind: NodeKind; shape: SceneShape; label: SceneLabel; labelInside: boolean };
export type EdgePath = { start: Point; end: Point; control?: Point };
export type SceneEdge = {
  index: number;
  dashed: boolean;
  /** False for a plain line, drawn with no arrowhead. */
  head: boolean;
  path: EdgePath;
  label?: SceneLabel;
  /** Compact sequences number their arrows instead of labelling them. */
  badge?: { x: number; y: number; n: number };
};
export type Scene = {
  kind: DiagramSpec["kind"];
  compact: boolean;
  viewBox: { x: number; y: number; w: number; h: number };
  nodes: SceneNode[];
  edges: SceneEdge[];
  lifelines: { x: number; y1: number; y2: number }[];
};

export const NODE_FONT = 14;
export const EDGE_FONT = 13;
export const LINE_HEIGHT = 1.25;
const PAD = 18;

type Box = { left: number; right: number; top: number; bottom: number };
type Measured = { node: DiagramNode; lines: string[]; inside: boolean; r: number; w: number; h: number; box: Box };

function measure(node: DiagramNode, compact: boolean, labelBeside: boolean, crowded = false): Measured {
  const lh = NODE_FONT * LINE_HEIGHT;
  if (node.kind === "actor") {
    const tw = textWidth(node.label, NODE_FONT);
    if (tw <= 50) {
      const r = Math.max(24, Math.ceil((tw + 12) / 2));
      return { node, lines: [node.label], inside: true, r, w: 2 * r, h: 2 * r, box: { left: r, right: r, top: r, bottom: r } };
    }
    const r = 24;
    const lines = wrapText(node.label, NODE_FONT, compact ? 88 : 104, 3);
    const lw = linesWidth(lines, NODE_FONT);
    const box = labelBeside
      ? { left: r, right: r + 8 + lw, top: Math.max(r, (lines.length * lh) / 2), bottom: Math.max(r, (lines.length * lh) / 2) }
      : { left: Math.max(r, lw / 2), right: Math.max(r, lw / 2), top: r, bottom: r + 6 + lines.length * lh };
    return { node, lines, inside: false, r, w: 2 * r, h: 2 * r, box };
  }
  if (node.kind === "decision") {
    // Text fits a diamond when its width share plus its height share of the diamond is under 1,
    // so the diamond is about 1.5 times the text's width and tall enough for the rest.
    const lines = wrapText(node.label, NODE_FONT, crowded ? 84 : compact ? 104 : 120, 4);
    const tw = linesWidth(lines, NODE_FONT);
    const th = lines.length * lh;
    const w = Math.max(96, Math.ceil(tw * 1.5 + 28));
    const h = Math.max(64, Math.ceil(th / (1 - tw / w) + 14));
    return { node, lines, inside: true, r: 0, w, h, box: { left: w / 2, right: w / 2, top: h / 2, bottom: h / 2 } };
  }
  // Three or more parts side by side on a phone get narrower boxes with up to three lines.
  // Long step text (common in existing Mermaid) gets a wider box and more lines rather than tiny type.
  const long = node.label.length > 60;
  const lines = wrapText(node.label, NODE_FONT, crowded ? 84 : long ? (compact ? 150 : 176) : compact ? 112 : 128, long ? 5 : 3);
  const w = Math.max(76, Math.ceil(linesWidth(lines, NODE_FONT) + 28));
  const h = 28 + lines.length * NODE_FONT * LINE_HEIGHT + (node.kind === "store" ? 12 : 0);
  return { node, lines, inside: true, r: 0, w, h, box: { left: w / 2, right: w / 2, top: h / 2, bottom: h / 2 } };
}

function placeNode(m: Measured, cx: number, cy: number, labelBeside: boolean): SceneNode {
  const lh = NODE_FONT * LINE_HEIGHT;
  const centred = (y: number, count: number) => y - ((count - 1) * lh) / 2 + NODE_FONT * 0.35;
  if (m.node.kind === "actor") {
    const shape = { type: "circle" as const, cx, cy, r: m.r };
    if (m.inside) return { id: m.node.id, kind: m.node.kind, shape, labelInside: true, label: { lines: m.lines, x: cx, y: centred(cy, 1), anchor: "middle", size: NODE_FONT } };
    const label: SceneLabel = labelBeside
      ? { lines: m.lines, x: cx + m.r + 8, y: centred(cy, m.lines.length), anchor: "start", size: NODE_FONT }
      : { lines: m.lines, x: cx, y: cy + m.r + 6 + NODE_FONT * 0.95, anchor: "middle", size: NODE_FONT };
    return { id: m.node.id, kind: m.node.kind, shape, labelInside: false, label };
  }
  const shape = { type: m.node.kind === "decision" ? ("diamond" as const) : ("rect" as const), x: cx - m.w / 2, y: cy - m.h / 2, w: m.w, h: m.h };
  // A store's top cap takes 12 units, so its text sits a little lower.
  const textCy = m.node.kind === "store" ? cy + 4 : cy;
  return { id: m.node.id, kind: m.node.kind, shape, labelInside: true, label: { lines: m.lines, x: cx, y: centred(textCy, m.lines.length), anchor: "middle", size: NODE_FONT } };
}

// ---------------------------------------------------------------- geometry

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
const len = (a: Point) => Math.hypot(a.x, a.y) || 1;
const unit = (a: Point): Point => mul(a, 1 / len(a));
const perp = (a: Point): Point => ({ x: -a.y, y: a.x });

export function shapeCentre(shape: SceneShape): Point {
  return shape.type === "circle" ? { x: shape.cx, y: shape.cy } : { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
}

/** Where a ray from `from` (inside the shape) in direction `dir` leaves the shape. */
function exitPoint(shape: SceneShape, from: Point, dir: Point): Point {
  const d = unit(dir);
  if (shape.type === "circle") {
    const f = sub(from, { x: shape.cx, y: shape.cy });
    const b = f.x * d.x + f.y * d.y;
    const c = f.x * f.x + f.y * f.y - shape.r * shape.r;
    const t = -b + Math.sqrt(Math.max(0, b * b - c));
    return add(from, mul(d, t));
  }
  if (shape.type === "diamond") return diamondExit(shape, from, d);
  const ts: number[] = [];
  if (d.x > 1e-9) ts.push((shape.x + shape.w - from.x) / d.x);
  if (d.x < -1e-9) ts.push((shape.x - from.x) / d.x);
  if (d.y > 1e-9) ts.push((shape.y + shape.h - from.y) / d.y);
  if (d.y < -1e-9) ts.push((shape.y - from.y) / d.y);
  return add(from, mul(d, Math.max(0, Math.min(...ts))));
}

/**
 * Where a line leaves a diamond. A line from the centre meets the diamond at the
 * point it heads for (top, right, bottom or left), as flowcharts draw it. A line
 * offset from the centre (one of a pair) crosses the diamond's edge instead.
 */
function diamondExit(shape: { x: number; y: number; w: number; h: number }, from: Point, d: Point): Point {
  const c = { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
  const a = shape.w / 2;
  const b = shape.h / 2;
  if (Math.hypot(from.x - c.x, from.y - c.y) < 1) {
    const points = [{ x: c.x, y: c.y - b }, { x: c.x + a, y: c.y }, { x: c.x, y: c.y + b }, { x: c.x - a, y: c.y }];
    // Compare directions in units of the diamond's own half widths, so a wide diamond still snaps sensibly.
    const score = (p: Point) => ((p.x - c.x) / a) * d.x + ((p.y - c.y) / b) * d.y;
    return points.reduce((best, p) => (score(p) > score(best) ? p : best));
  }
  let lo = 0;
  let hi = shape.w + shape.h;
  for (let i = 0; i < 32; i++) {
    const t = (lo + hi) / 2;
    const p = add(from, mul(d, t));
    if (Math.abs(p.x - c.x) / a + Math.abs(p.y - c.y) / b < 1) lo = t;
    else hi = t;
  }
  return add(from, mul(d, lo));
}

export function pathPoint(path: EdgePath, t: number): Point {
  if (!path.control) return add(path.start, mul(sub(path.end, path.start), t));
  const a = mul(path.start, (1 - t) * (1 - t));
  const b = mul(path.control, 2 * (1 - t) * t);
  const c = mul(path.end, t * t);
  return add(add(a, b), c);
}

/** Unit direction of travel at the end of the path, for the arrowhead. */
export function endDirection(path: EdgePath): Point {
  return unit(sub(path.end, path.control ?? path.start));
}

function inflate(shape: SceneShape, by: number) {
  if (shape.type === "circle") return { x: shape.cx - shape.r - by, y: shape.cy - shape.r - by, w: 2 * (shape.r + by), h: 2 * (shape.r + by) };
  return { x: shape.x - by, y: shape.y - by, w: shape.w + 2 * by, h: shape.h + 2 * by };
}

function hitsAny(path: EdgePath, others: SceneShape[]): boolean {
  for (let i = 1; i < 24; i++) {
    const p = pathPoint(path, i / 24);
    for (const shape of others) {
      const r = inflate(shape, 8);
      if (p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) return true;
    }
  }
  return false;
}

function edgeLabel(lines: string[], at: Point, side: Point, gap = 0): SceneLabel {
  const lh = EDGE_FONT * LINE_HEIGHT;
  if (Math.abs(side.y) > Math.abs(side.x)) {
    const y = side.y < 0 ? at.y - 9 - gap - (lines.length - 1) * lh - EDGE_FONT * 0.2 : at.y + 9 + gap + EDGE_FONT * 0.8;
    return { lines, x: at.x, y, anchor: "middle", size: EDGE_FONT };
  }
  const y = at.y - ((lines.length - 1) * lh) / 2 + EDGE_FONT * 0.35;
  return side.x > 0 ? { lines, x: at.x + 10 + gap, y, anchor: "start", size: EDGE_FONT } : { lines, x: at.x - 10 - gap, y, anchor: "end", size: EDGE_FONT };
}

function labelBox(label: SceneLabel) {
  const w = linesWidth(label.lines, label.size);
  const h = label.lines.length * label.size * LINE_HEIGHT;
  const x = label.anchor === "middle" ? label.x - w / 2 : label.anchor === "start" ? label.x : label.x - w;
  return { x, y: label.y - label.size, w, h };
}

type Rect = { x: number; y: number; w: number; h: number };
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const contains = (a: Rect, p: Point) => p.x > a.x && p.x < a.x + a.w && p.y > a.y && p.y < a.y + a.h;

/**
 * Puts each arrow label where it covers no part, no other label and no line.
 * Tries the middle of the arrow on its usual side first, then nearby spots;
 * if every spot clashes, it keeps the one with the fewest clashes.
 */
function placeLabels(nodes: SceneNode[], edges: { path: EdgePath; lines: string[]; side: Point; keepSide: boolean }[]): (SceneLabel | undefined)[] {
  const solid: Rect[] = nodes.flatMap((node) => [inflate(node.shape, 4), labelBox(node.label)]);
  const samples = edges.map((edge) => Array.from({ length: 33 }, (_, i) => pathPoint(edge.path, i / 32)));
  const placed: Rect[] = [];
  return edges.map((edge) => {
    if (!edge.lines.length) return undefined;
    let best: { label: SceneLabel; clashes: number } | undefined;
    for (const t of [0.5, 0.4, 0.6, 0.3, 0.7]) {
      // A label on one of a pair of arrows stays on its own outer side, or it reads as the other one's.
      for (const sign of edge.keepSide ? [1] : [1, -1]) {
        for (const gap of [0, 10, 22]) {
          const label = edgeLabel(edge.lines, pathPoint(edge.path, t), mul(edge.side, sign), gap);
          const box = labelBox(label);
          const pad = { x: box.x - 3, y: box.y - 3, w: box.w + 6, h: box.h + 6 };
          // Covering text is worse than crossing a line, which the label's halo keeps readable.
          let clashes = 20 * (solid.filter((rect) => overlaps(pad, rect)).length + placed.filter((rect) => overlaps(pad, rect)).length);
          samples.forEach((points) => { clashes += points.filter((p) => contains(pad, p)).length; });
          if (!best || clashes < best.clashes) best = { label, clashes };
          if (clashes === 0) break;
        }
        if (best?.clashes === 0) break;
      }
      if (best?.clashes === 0) break;
    }
    placed.push(labelBox(best!.label));
    return best!.label;
  });
}

function fitViewBox(nodes: SceneNode[], edges: SceneEdge[], extra: { x: number; y: number }[] = []) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const take = (x: number, y: number, w = 0, h = 0) => {
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
  };
  for (const node of nodes) {
    const r = inflate(node.shape, 0);
    take(r.x, r.y, r.w, r.h);
    const b = labelBox(node.label);
    take(b.x, b.y, b.w, b.h);
  }
  for (const edge of edges) {
    take(edge.path.start.x, edge.path.start.y);
    take(edge.path.end.x, edge.path.end.y);
    if (edge.path.control) { const mid = pathPoint(edge.path, 0.5); take(mid.x, mid.y); }
    if (edge.label) { const b = labelBox(edge.label); take(b.x, b.y, b.w, b.h); }
    if (edge.badge) take(edge.badge.x - 12, edge.badge.y - 12, 24, 24);
  }
  for (const p of extra) take(p.x, p.y);
  return { x: Math.floor(minX - PAD), y: Math.floor(minY - PAD), w: Math.ceil(maxX - minX + 2 * PAD), h: Math.ceil(maxY - minY + 2 * PAD) };
}

// ---------------------------------------------------------------- flow

function ranks(spec: DiagramSpec): Map<string, number> {
  const out = new Map<string, Set<number>>();
  spec.nodes.forEach((node) => out.set(node.id, new Set()));
  spec.edges.forEach((edge, i) => out.get(edge.from)!.add(i));
  // Arrows that close a loop (a reply going back) do not push a part further along.
  const back = new Set<number>();
  const state = new Map<string, "open" | "done">();
  const visit = (id: string) => {
    state.set(id, "open");
    for (const i of out.get(id)!) {
      const to = spec.edges[i].to;
      if (state.get(to) === "open") back.add(i);
      else if (!state.has(to)) visit(to);
    }
    state.set(id, "done");
  };
  spec.nodes.forEach((node) => { if (!state.has(node.id)) visit(node.id); });

  const rank = new Map(spec.nodes.map((node) => [node.id, 0]));
  // Longest path over the forward arrows; at most one pass per part.
  for (let pass = 0; pass < spec.nodes.length; pass++) {
    let changed = false;
    spec.edges.forEach((edge, i) => {
      if (back.has(i)) return;
      const next = rank.get(edge.from)! + 1;
      if (next > rank.get(edge.to)!) { rank.set(edge.to, next); changed = true; }
    });
    if (!changed) break;
  }
  return rank;
}

export function layoutFlow(spec: DiagramSpec, compact: boolean): Scene {
  const down = compact || spec.direction === "down";
  const rank = ranks(spec);
  const layerCount = Math.max(...rank.values()) + 1;
  const widest = Math.max(...Array.from({ length: layerCount }, (_, r) => [...rank.values()].filter((v) => v === r).length));
  const crowded = compact && widest >= 3;
  const measured = new Map(spec.nodes.map((node) => [node.id, measure(node, compact, down, crowded)]));
  const layers: string[][] = Array.from({ length: layerCount }, () => []);
  spec.nodes.forEach((node) => layers[rank.get(node.id)!].push(node.id));

  // Order each layer by where its neighbours in earlier layers sit, to cut crossings.
  const order = new Map<string, number>();
  layers.forEach((layer, r) => {
    const declared = new Map(layer.map((id, i) => [id, i]));
    const bary = (id: string) => {
      const near = spec.edges
        .flatMap((edge) => (edge.to === id ? [edge.from] : edge.from === id ? [edge.to] : []))
        .filter((other) => rank.get(other)! < r && order.has(other))
        .map((other) => order.get(other)!);
      return near.length ? near.reduce((a, b) => a + b, 0) / near.length : declared.get(id)!;
    };
    const keys = new Map(layer.map((id) => [id, bary(id)]));
    layer.sort((a, b) => keys.get(a)! - keys.get(b)! || declared.get(a)! - declared.get(b)!);
    layer.forEach((id, i) => order.set(id, i));
  });

  const labelMax = compact ? 120 : down ? 150 : 132;
  const edgeLines = spec.edges.map((edge) => (edge.label ? wrapText(edge.label, EDGE_FONT, labelMax, 3) : []));
  const lh = EDGE_FONT * LINE_HEIGHT;

  const mainBefore = (m: Measured) => (down ? m.box.top : m.box.left);
  const mainAfter = (m: Measured) => (down ? m.box.bottom : m.box.right);
  const crossBefore = (m: Measured) => (down ? m.box.left : m.box.top);
  const crossAfter = (m: Measured) => (down ? m.box.right : m.box.bottom);

  // Main axis: one band per layer, with room between bands for the arrow labels.
  const mainPos: number[] = [];
  let cursor = 0;
  for (let r = 0; r < layerCount; r++) {
    const before = Math.max(...layers[r].map((id) => mainBefore(measured.get(id)!)));
    const after = Math.max(...layers[r].map((id) => mainAfter(measured.get(id)!)));
    cursor += before;
    mainPos.push(cursor);
    cursor += after;
    if (r < layerCount - 1) {
      // Across a rightward flow the labels between two bands sit side by side; down a
      // downward flow they stack, so it leaves room for all of them.
      let gap = down ? 52 : 68;
      let stacked = 16;
      spec.edges.forEach((edge, i) => {
        const span = [rank.get(edge.from)!, rank.get(edge.to)!].sort((a, b) => a - b);
        if (span[0] !== r || span[1] !== r + 1 || !edgeLines[i].length) return;
        if (down) stacked += edgeLines[i].length * lh + 8;
        else gap = Math.max(gap, linesWidth(edgeLines[i], EDGE_FONT) + 28);
      });
      cursor += down ? Math.max(gap, stacked) : gap;
    }
  }

  // Cross axis: parts in one layer side by side, centred on the axis.
  const crossGap = down ? (crowded ? 16 : 24) : edgeLines.some((lines) => lines.length) ? 44 : 30;
  const centres = new Map<string, Point>();
  layers.forEach((layer, r) => {
    const total = layer.reduce((sum, id) => sum + crossBefore(measured.get(id)!) + crossAfter(measured.get(id)!), 0) + crossGap * (layer.length - 1);
    let at = -total / 2;
    for (const id of layer) {
      const m = measured.get(id)!;
      at += crossBefore(m);
      centres.set(id, down ? { x: at, y: mainPos[r] } : { x: mainPos[r], y: at });
      at += crossAfter(m) + crossGap;
    }
  });

  const nodes = spec.nodes.map((node) => {
    const c = centres.get(node.id)!;
    return placeNode(measured.get(node.id)!, c.x, c.y, down);
  });
  const shapeOf = new Map(nodes.map((node) => [node.id, node.shape]));
  const place = (id: string) => [rank.get(id)!, order.get(id)!] as const;
  const before = (a: string, b: string) => { const [ra, oa] = place(a); const [rb, ob] = place(b); return ra < rb || (ra === rb && oa < ob); };

  const routed = spec.edges.map((edge, index) => {
    const paired = spec.edges.some((other) => other.from === edge.to && other.to === edge.from);
    const forward = before(edge.from, edge.to);
    const [lo, hi] = forward ? [edge.from, edge.to] : [edge.to, edge.from];
    const axis = unit(sub(centres.get(hi)!, centres.get(lo)!));
    // The side that faces "up" for a left-to-right arrow and "right" for a top-to-bottom one.
    const side = mul(perp(axis), -1);
    const offset = paired ? mul(side, forward ? 8 : -8) : { x: 0, y: 0 };
    const a = add(centres.get(edge.from)!, offset);
    const b = add(centres.get(edge.to)!, offset);
    const others = nodes.filter((node) => node.id !== edge.from && node.id !== edge.to).map((node) => node.shape);

    const build = (control?: Point): EdgePath => {
      const startDir = sub(control ?? b, a);
      const endDir = sub(control ?? a, b);
      const start = exitPoint(shapeOf.get(edge.from)!, a, startDir);
      const end = exitPoint(shapeOf.get(edge.to)!, b, endDir);
      const back = unit(endDir);
      return { start: add(start, mul(unit(startDir), 2)), end: add(end, mul(back, 3)), control };
    };
    let path = build();
    let labelSide = paired && !forward ? mul(side, -1) : side;
    if (hitsAny(path, others)) {
      // A curve reaches half its control offset, so the offset is twice the room needed to
      // pass the widest part in the way; try further out if that still clips something.
      const mid = mul(add(a, b), 0.5);
      const across = Math.abs(side.x) > Math.abs(side.y) ? "w" : "h";
      const half = Math.max(...others.map((shape) => inflate(shape, 0)[across] / 2), 20);
      search: for (const scale of [1, 1.5, 2.2]) {
        for (const sign of [1, -1]) {
          const candidate = build(add(mid, mul(side, sign * scale * 2 * (half + 18))));
          if (!hitsAny(candidate, others)) { path = candidate; labelSide = mul(side, sign); break search; }
        }
      }
    }
    return { path, lines: edgeLines[index], side: labelSide, keepSide: paired };
  });
  const labels = placeLabels(nodes, routed);
  const edges: SceneEdge[] = spec.edges.map((edge, index) => ({ index, dashed: edge.dashed, head: edge.head, path: routed[index].path, label: labels[index] }));

  return { kind: "flow", compact, viewBox: fitViewBox(nodes, edges), nodes, edges, lifelines: [] };
}

// ---------------------------------------------------------------- sequence

export function layoutSequence(spec: DiagramSpec, compact: boolean): Scene {
  const measured = spec.nodes.map((node) => measure(node, compact, false));
  const lane = new Map(spec.nodes.map((node, i) => [node.id, i]));
  const gaps = measured.slice(1).map((m, i) => Math.max(measured[i].box.right + m.box.left + 24, compact ? 64 : 104));
  const lh = EDGE_FONT * LINE_HEIGHT;
  const edgeLines = spec.edges.map((edge) => (compact || !edge.label ? [] : wrapText(edge.label, EDGE_FONT, 168, 3)));

  // Widen the gaps under a message until its label fits between its two lanes.
  spec.edges.forEach((edge, i) => {
    if (!edgeLines[i].length) return;
    const [l, r] = [lane.get(edge.from)!, lane.get(edge.to)!].sort((a, b) => a - b);
    const need = linesWidth(edgeLines[i], EDGE_FONT) + 28;
    const have = gaps.slice(l, r).reduce((a, b) => a + b, 0);
    if (have < need) for (let g = l; g < r; g++) gaps[g] += (need - have) / (r - l);
  });

  const xs = [0];
  gaps.forEach((gap) => xs.push(xs[xs.length - 1] + gap));
  const top = Math.max(...measured.map((m) => m.box.top));
  const nodes = measured.map((m, i) => placeNode(m, xs[i], top, false));
  const headerBottom = Math.max(...measured.map((m) => top + m.box.bottom));

  let y = headerBottom + 26;
  const edges: SceneEdge[] = spec.edges.map((edge, index) => {
    const x1 = xs[lane.get(edge.from)!];
    const x2 = xs[lane.get(edge.to)!];
    const dir = Math.sign(x2 - x1);
    if (compact) {
      const arrowY = y + 26;
      y = arrowY + 18;
      const mid = (x1 + x2) / 2;
      return { index, dashed: edge.dashed, head: edge.head, path: { start: { x: x1 + dir * 2, y: arrowY }, end: { x: x2 - dir * 3, y: arrowY } }, badge: { x: mid, y: arrowY - 14, n: index + 1 } };
    }
    const lines = edgeLines[index];
    const arrowY = y + lines.length * lh + 8;
    const label: SceneLabel | undefined = lines.length ? { lines, x: (x1 + x2) / 2, y: y + EDGE_FONT, anchor: "middle", size: EDGE_FONT } : undefined;
    y = arrowY + 24;
    return { index, dashed: edge.dashed, head: edge.head, path: { start: { x: x1 + dir * 2, y: arrowY }, end: { x: x2 - dir * 3, y: arrowY } }, label };
  });

  const lifelines = nodes.map((_, i) => ({ x: xs[i], y1: top + measured[i].box.bottom + 4, y2: y }));
  const viewBox = fitViewBox(nodes, edges, lifelines.map((line) => ({ x: line.x, y: line.y2 })));
  return { kind: "sequence", compact, viewBox, nodes, edges, lifelines };
}

export function layoutDiagram(spec: DiagramSpec, compact: boolean): Scene {
  return spec.kind === "flow" ? layoutFlow(spec, compact) : layoutSequence(spec, compact);
}
