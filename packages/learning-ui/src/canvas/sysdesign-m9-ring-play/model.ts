import { HASH_SPACE, hash32 } from "../models/hash32";
import type { Tone } from "../primitives/tones";

// 9.3 beat 4: a consistent hash ring with virtual nodes. 10,000 sample keys
// `order:0` to `order:9999`; node `name` with `v` points puts them at
// hash32(name + "#" + i). A key belongs to the first point at or after its
// own hash, wrapping round; equal positions go to the node with the smaller
// name. The numbers match the chapter's simulation. Pure, no React.

export const KEY_COUNT = 10000;
export const POINT_LADDER = [1, 2, 5, 10, 20, 50, 100, 200] as const;
export const DEFAULT_POINTS = 1;
export const NODE_NAMES = ["node-a", "node-b", "node-c", "node-d", "node-e", "node-f", "node-g", "node-h"] as const;
export const MIN_NODES = 2;
export const MAX_NODES = 8;
export const START_NODES = 4;
/** One key in this many is drawn as a dot on the ring. */
export const SAMPLE_STEP = 56;

let hashes: number[] | null = null;
/** Hashes of the sample keys, computed once. */
export function keyHashes(): number[] {
  if (!hashes) {
    hashes = new Array<number>(KEY_COUNT);
    for (let i = 0; i < KEY_COUNT; i++) hashes[i] = hash32(`order:${i}`);
  }
  return hashes;
}

/** Indices of the keys drawn as dots round the ring. */
export const SAMPLE_KEYS: readonly number[] = Array.from({ length: Math.ceil(KEY_COUNT / SAMPLE_STEP) }, (_, i) => i * SAMPLE_STEP);

export type RingPoint = { pos: number; node: string; index: number };

const pointCache = new Map<string, number>();
function pointPos(node: string, i: number): number {
  const k = `${node}#${i}`;
  let p = pointCache.get(k);
  if (p === undefined) {
    p = hash32(k);
    pointCache.set(k, p);
  }
  return p;
}

/** The points of a ring, sorted by position (ties by node name, then point number). */
export function buildRing(nodes: readonly string[], v: number): RingPoint[] {
  const pts: RingPoint[] = [];
  for (const node of nodes) for (let i = 0; i < v; i++) pts.push({ pos: pointPos(node, i), node, index: i });
  pts.sort((a, b) => a.pos - b.pos || (a.node < b.node ? -1 : a.node > b.node ? 1 : a.index - b.index));
  return pts;
}

/** The first point at or after position h, wrapping to the first point. */
export function ownerPoint(points: readonly RingPoint[], h: number): RingPoint {
  let lo = 0;
  let hi = points.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid].pos >= h) hi = mid;
    else lo = mid + 1;
  }
  return points[lo === points.length ? 0 : lo];
}

export type Assignment = {
  nodes: readonly string[];
  v: number;
  points: RingPoint[];
  /** The owner of each of the 10,000 keys. */
  owners: string[];
  /** Keys per node, in the order of `nodes`. */
  counts: number[];
};

const cache = new Map<string, Assignment>();

export function assign(nodes: readonly string[], v: number): Assignment {
  const key = `${nodes.join(",")}|${v}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const points = buildRing(nodes, v);
  const hs = keyHashes();
  const owners = new Array<string>(KEY_COUNT);
  const tally = new Map<string, number>(nodes.map((n) => [n, 0]));
  for (let i = 0; i < KEY_COUNT; i++) {
    const o = ownerPoint(points, hs[i]).node;
    owners[i] = o;
    tally.set(o, (tally.get(o) ?? 0) + 1);
  }
  const result: Assignment = { nodes, v, points, owners, counts: nodes.map((n) => tally.get(n) ?? 0) };
  if (cache.size > 80) cache.clear();
  cache.set(key, result);
  return result;
}

export const nodesOf = (count: number): string[] => NODE_NAMES.slice(0, Math.max(MIN_NODES, Math.min(MAX_NODES, count)));

/** The busiest node's keys divided by a fair share (10,000 over the nodes). */
export function busiestOverFair(counts: readonly number[]): number {
  return Math.max(...counts) / (KEY_COUNT / counts.length);
}

export type Move = {
  /** Keys that changed owner. */
  moved: number;
  share: number;
  /** Of those, keys that went from one node to another that were both on the ring before and after. Always 0 for a ring. */
  between: number;
  /** Indices of the sample keys that moved. */
  movedSamples: number[];
};

export function compare(before: Assignment, after: Assignment): Move {
  const stay = new Set(after.nodes.filter((n) => before.nodes.includes(n)));
  let moved = 0;
  let between = 0;
  for (let i = 0; i < KEY_COUNT; i++) {
    if (before.owners[i] === after.owners[i]) continue;
    moved++;
    if (stay.has(before.owners[i]) && stay.has(after.owners[i])) between++;
  }
  const movedSamples = SAMPLE_KEYS.filter((k) => before.owners[k] !== after.owners[k]);
  return { moved, share: moved / KEY_COUNT, between, movedSamples };
}

/** The share of keys that change shard when hash mod a becomes hash mod b. */
export function modMoveShare(a: number, b: number): number {
  const hs = keyHashes();
  let n = 0;
  for (let i = 0; i < KEY_COUNT; i++) if (hs[i] % a !== hs[i] % b) n++;
  return n / KEY_COUNT;
}

// ---------- Verdicts ----------

const pct = (share: number) => `${(share * 100).toFixed(1)}%`;
export const ratioText = (r: number) => r.toFixed(2);
export const percentText = pct;

export function spreadVerdict(ratio: number): { text: string; tone: Tone } {
  return { text: `Busiest node: ${ratioText(ratio)} times its share`, tone: ratio > 1.5 ? "bad" : ratio > 1.15 ? "warn" : "good" };
}

/** The share a perfect ring would move: a new node takes 1 in N+1; a removed node's keys are 1 in N. */
export function idealMove(kind: "add" | "remove", nodesBefore: number): number {
  return kind === "add" ? 1 / (nodesBefore + 1) : 1 / nodesBefore;
}

export function moveVerdict(kind: "add" | "remove", name: string, share: number, ideal: number): { text: string; tone: Tone } {
  return { text: `${kind === "add" ? "Added" : "Removed"} ${name}: ${pct(share)} of keys moved`, tone: share <= 1.3 * ideal ? "good" : "warn" };
}

// ---------- The dial ----------

export function pointsFromFraction(f: number): number {
  const t = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  return POINT_LADDER[Math.round(t * (POINT_LADDER.length - 1))];
}

export function pointsToFraction(v: number): number {
  const i = POINT_LADDER.indexOf(v as (typeof POINT_LADDER)[number]);
  return (i < 0 ? 0 : i) / (POINT_LADDER.length - 1);
}

// ---------- Geometry (pure, so a test can check the arcs close up) ----------

/** Angle in radians from 12 o'clock, clockwise, for a position on the ring. */
export const posToAngle = (pos: number) => (pos / HASH_SPACE) * Math.PI * 2;

export const angleToPos = (angle: number) => {
  const turn = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.min(HASH_SPACE - 1, Math.round((turn / (Math.PI * 2)) * HASH_SPACE));
};

export type Arc = { node: string; from: number; to: number };

/** The ring cut into arcs, each owned by the node of the point at its clockwise end. Neighbouring arcs of one node are joined. Angles in radians; the first arc may start below 0. */
export function ringArcs(points: readonly RingPoint[]): Arc[] {
  const n = points.length;
  const arcs: Arc[] = [];
  for (let i = 0; i < n; i++) {
    const from = posToAngle(i === 0 ? points[n - 1].pos - HASH_SPACE : points[i - 1].pos);
    const to = posToAngle(points[i].pos);
    const last = arcs[arcs.length - 1];
    if (last && last.node === points[i].node && Math.abs(last.to - from) < 1e-9) last.to = to;
    else arcs.push({ node: points[i].node, from, to });
  }
  return arcs;
}

const f1 = (v: number) => Math.round(v * 10) / 10;

/** An SVG path for a set of arcs on a circle of radius r (clockwise from 12 o'clock). */
export function arcPath(arcs: readonly Arc[], cx: number, cy: number, r: number): string {
  const at = (a: number) => `${f1(cx + r * Math.sin(a))} ${f1(cy - r * Math.cos(a))}`;
  return arcs
    .filter((a) => a.to - a.from > 1e-6)
    .map((a) => `M${at(a.from)}A${r} ${r} 0 ${a.to - a.from > Math.PI ? 1 : 0} 1 ${at(a.to)}`)
    .join("");
}

const TAU = Math.PI * 2;

/**
 * Arcs cut at the edges of equal sectors of the circle (0 to 2 pi from 12
 * o'clock), as one path per node and sector. A path's bounding box then stays
 * near its own bit of the ring, so a label inside the ring is never covered by
 * the box of an arc on the far side.
 */
export function sectorPaths(arcs: readonly Arc[], cx: number, cy: number, r: number, sectors = 24): { key: string; node: string; d: string }[] {
  const size = TAU / sectors;
  const pieces = new Map<string, { node: string; list: Arc[] }>();
  const add = (node: string, from: number, to: number) => {
    if (to - from <= 1e-6) return;
    const first = Math.floor(from / size + 1e-9);
    const last = Math.min(sectors - 1, Math.floor((to - 1e-9) / size));
    for (let k = first; k <= last; k++) {
      const key = `${node}|${k}`;
      const entry = pieces.get(key) ?? { node, list: [] };
      entry.list.push({ node, from: Math.max(from, k * size), to: Math.min(to, (k + 1) * size) });
      pieces.set(key, entry);
    }
  };
  for (const a of arcs) {
    if (a.from < 0) {
      add(a.node, a.from + TAU, TAU);
      add(a.node, 0, a.to);
    } else add(a.node, a.from, a.to);
  }
  return [...pieces].map(([key, e]) => ({ key, node: e.node, d: arcPath(e.list, cx, cy, r) }));
}

/** A point on a circle at a position of the ring. */
export function ringPoint(pos: number, cx: number, cy: number, r: number): { x: number; y: number } {
  const a = posToAngle(pos);
  // Rounded, so the server and the browser print the same coordinates.
  return { x: Math.round((cx + r * Math.sin(a)) * 100) / 100, y: Math.round((cy - r * Math.cos(a)) * 100) / 100 };
}
