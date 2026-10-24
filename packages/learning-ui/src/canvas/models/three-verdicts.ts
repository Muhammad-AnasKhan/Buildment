import { allCombinations, conflictIds, nextValue, verdicts, weakestFailing, withValue, type HistoryOp, type Verdicts } from "./history";

// 11.4 beat 1: four presets of one history picture. Tap a read to change what
// it returned and read the three verdicts. The checkers are in ./history.

export type PresetId = "fresh" | "stale" | "two-readers" | "reply-first";

export type Preset = {
  id: PresetId;
  label: string;
  clients: string[];
  axis: { min: number; max: number; step: number };
  ops: HistoryOp[];
  /** For each read the player can change: the values it cycles through. */
  lists: Record<string, number[]>;
};

/** Value words for the forum keys: 0 is "none", 7 is the question Q, 9 is the reply R. */
export const VALUE_NAMES: Record<string, Record<number, string>> = {
  q: { 0: "none", 7: "Q" },
  r: { 0: "none", 9: "R" },
};

export const valueText = (key: string, value: number): string => VALUE_NAMES[key]?.[value] ?? String(value);

const w = (id: string, client: string, key: string, value: number, start: number, end: number): HistoryOp => ({ id, client, kind: "write", key, value, start, end });
const r = (id: string, client: string, key: string, value: number, start: number, end: number): HistoryOp => ({ id, client, kind: "read", key, value, start, end });

const ONE_WRITE = (readValue: number): HistoryOp[] => [w("a", "Ada", "x", 1, 10, 20), r("b", "Ben", "x", readValue, 30, 40)];

export const PRESETS: readonly Preset[] = [
  { id: "fresh", label: "Fresh read", clients: ["Ada", "Ben"], axis: { min: 0, max: 50, step: 10 }, ops: ONE_WRITE(1), lists: { b: [0, 1] } },
  { id: "stale", label: "Stale read", clients: ["Ada", "Ben"], axis: { min: 0, max: 50, step: 10 }, ops: ONE_WRITE(0), lists: { b: [0, 1] } },
  {
    id: "two-readers",
    label: "Two readers",
    clients: ["Ada", "Bao", "Cam", "Dan"],
    axis: { min: 0, max: 50, step: 10 },
    ops: [
      w("a", "Ada", "x", 1, 10, 20),
      w("b", "Bao", "x", 2, 12, 22),
      r("c1", "Cam", "x", 1, 30, 35),
      r("c2", "Cam", "x", 2, 40, 45),
      r("d1", "Dan", "x", 2, 30, 35),
      r("d2", "Dan", "x", 1, 40, 45),
    ],
    lists: { c1: [0, 1, 2], c2: [0, 1, 2], d1: [0, 1, 2], d2: [0, 1, 2] },
  },
  {
    id: "reply-first",
    label: "Reply first",
    clients: ["Ada", "Bao", "Cam"],
    axis: { min: 0, max: 90, step: 10 },
    ops: [
      w("a", "Ada", "q", 7, 10, 20),
      r("b1", "Bao", "q", 7, 30, 40),
      w("b2", "Bao", "r", 9, 45, 55),
      r("c1", "Cam", "r", 9, 60, 70),
      r("c2", "Cam", "q", 0, 75, 85),
    ],
    lists: { b1: [0, 7], c1: [0, 9], c2: [0, 7] },
  },
];

export const presetById = (id: PresetId): Preset => PRESETS.find((p) => p.id === id) as Preset;

/** Tap a read: its value moves to the next one in its list. */
export function tapRead(preset: Preset, ops: readonly HistoryOp[], id: string): HistoryOp[] {
  const list = preset.lists[id];
  const op = ops.find((o) => o.id === id);
  if (!list || !op) return ops.slice();
  return withValue(ops, id, nextValue(list, op.value));
}

export type ThreeVerdictsView = {
  verdicts: Verdicts;
  banner: { text: string; tone: "good" | "bad" | "warn" };
  /** The operations to ring: the smallest conflicting set for the weakest model that fails. */
  rings: string[];
  /** The model whose conflict is ringed. */
  ringedModel: "lin" | "seq" | "causal" | null;
};

export function describe(ops: readonly HistoryOp[]): ThreeVerdictsView {
  const v = verdicts(ops);
  const model = weakestFailing(v);
  const rings = model ? conflictIds(ops, model) : [];
  if (v.lin && v.seq && v.causal) return { verdicts: v, banner: { text: "All three models allow this", tone: "good" }, rings, ringedModel: model };
  if (!v.lin && v.seq && v.causal) return { verdicts: v, banner: { text: "Linearizable fails; the others pass", tone: "warn" }, rings, ringedModel: model };
  if (!v.lin && !v.seq && v.causal) return { verdicts: v, banner: { text: "Only causal still allows this", tone: "warn" }, rings, ringedModel: model };
  return { verdicts: v, banner: { text: "All three models reject this", tone: "bad" }, rings, ringedModel: model };
}

/** Counts of the verdict triples over every combination of the preset's read values. */
export function countCombinations(preset: Preset): { total: number; byTriple: Record<string, number> } {
  const byTriple: Record<string, number> = {};
  const all = allCombinations(preset.ops, preset.lists);
  for (const h of all) {
    const v = verdicts(h);
    const key = [v.lin, v.seq, v.causal].map((b) => (b ? "yes" : "no")).join(",");
    byTriple[key] = (byTriple[key] ?? 0) + 1;
  }
  return { total: all.length, byTriple };
}
