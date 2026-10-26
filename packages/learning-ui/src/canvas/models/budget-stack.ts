import { wrapWords } from "./sorter";

// A budget stack as a pure model: blocks are read top to bottom, each costs
// some of a budget (seconds of a first look, lines of a preview), and the
// budget runs out somewhere down the stack. Which blocks get seen depends
// only on the order, the costs and the budget, so moving a proof block up is
// the whole game. No React here, so the rules and the layout are tested on
// their own.
//
// The seen rule: a block counts as seen when the budget covers at least half
// of its cost. A reader who reaches the middle of a block has usually caught
// its point; one who only reaches its first line has not.

export type StackKind = "proof" | "filler" | "context";

export type StackBlock = {
  id: string;
  /** What the block says, up to about 40 characters (two lines at most). */
  label: string;
  /** What reading it costs, in the stack's unit. More than 0. */
  cost: number;
  kind: StackKind;
  /** A short note read out with the block and shown when it is selected. Two lines at most. */
  note?: string;
};

/** Own wording for the verdict. `{seen}` and `{goal}` are filled in; each result at most 38 characters. */
export type StackVerdicts = { met: string; short: string };

export type StackRow = {
  block: StackBlock;
  /** Budget spent when the reader reaches this block. */
  start: number;
  end: number;
  /** Share of the block the budget covers, 0 to 1. */
  covered: number;
  seen: boolean;
};

/** A block counts as seen when the budget covers at least this share of it. */
export const SEEN_SHARE = 0.5;

export const STACK_LIMITS = {
  blocksMin: 4,
  blocksMax: 8,
  labelLines: 2,
  noteLines: 2,
  verdict: 38,
  budgetLabel: 36,
  /** The phone's top line, "<budgetLabel>: <budget> <unit>". */
  phoneLabel: 41,
  unit: 6,
} as const;

/** Characters per line of a block label (13.5 units bold inside 240 units). */
export const STACK_LABEL_CHARS = 30;
/** Characters per line of the note under the stack. */
export const STACK_NOTE_CHARS = 42;

export const KIND_WORD: Record<StackKind, string> = { proof: "Proof", filler: "Filler", context: "Context" };

/** The blocks in the order given by ids; unknown ids are skipped and missing blocks keep their data order at the end. */
export function orderBlocks(blocks: StackBlock[], order: string[]): StackBlock[] {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const out = order.map((id) => byId.get(id)).filter((b): b is StackBlock => !!b);
  for (const b of blocks) if (!order.includes(b.id)) out.push(b);
  return out;
}

/** Walk the stack and spend the budget: where each block starts and ends, how much of it is covered, and whether it is seen. */
export function stackRows(blocks: StackBlock[], budget: number): StackRow[] {
  let start = 0;
  return blocks.map((block) => {
    const end = start + block.cost;
    const covered = block.cost > 0 ? Math.max(0, Math.min(1, (budget - start) / block.cost)) : 0;
    const row = { block, start, end, covered, seen: covered >= SEEN_SHARE };
    start = end;
    return row;
  });
}

export function totalCost(blocks: StackBlock[]): number {
  return blocks.reduce((s, b) => s + b.cost, 0);
}

export function proofSeen(rows: StackRow[]): number {
  return rows.filter((r) => r.seen && r.block.kind === "proof").length;
}

export function proofCount(blocks: StackBlock[]): number {
  return blocks.filter((b) => b.kind === "proof").length;
}

/** Move one block up (-1) or down (+1). At the top or bottom nothing changes. */
export function moveBlock(order: string[], id: string, dir: -1 | 1): string[] {
  const i = order.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return order;
  const out = [...order];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

/** Move one block to a new index (a drag). */
export function moveTo(order: string[], id: string, index: number): string[] {
  const i = order.indexOf(id);
  if (i < 0) return order;
  const out = order.filter((x) => x !== id);
  out.splice(Math.max(0, Math.min(out.length, index)), 0, id);
  return out;
}

const fill = (template: string, seen: number, goal: number) => template.replace("{seen}", String(seen)).replace("{goal}", String(goal));

function verdictText(met: boolean, seen: number, goal: number, words?: StackVerdicts): string {
  if (words) return fill(met ? words.met : words.short, seen, goal);
  const blocks = seen === 1 ? "proof block" : "proof blocks";
  return met ? `Goal met: ${seen} ${blocks} seen` : `Only ${seen} of ${goal} proof blocks seen`;
}

/** The verdict: proof blocks seen against the goal. */
export function stackVerdict(rows: StackRow[], goal: number, words?: StackVerdicts): { met: boolean; text: string } {
  const seen = proofSeen(rows);
  const met = seen >= goal;
  return { met, text: verdictText(met, seen, goal, words) };
}

/**
 * Where the reading marker is after spending `spent` of the budget: the row
 * it is in and how far through it. Past the last block it rests at the end.
 */
export function markerAt(rows: StackRow[], spent: number): { index: number; frac: number } {
  if (!rows.length) return { index: 0, frac: 0 };
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (spent < r.end) return { index: i, frac: r.block.cost > 0 ? Math.max(0, (spent - r.start) / r.block.cost) : 0 };
  }
  return { index: rows.length - 1, frac: 1 };
}

/** What the marker spends in total: the budget, or less when the stack is shorter than the budget. */
export function spendable(rows: StackRow[], budget: number): number {
  return Math.min(budget, rows.length ? rows[rows.length - 1].end : 0);
}

/** The best order for the goal: proof blocks first, cheapest first, then the rest as given. */
export function bestOrder(blocks: StackBlock[]): StackBlock[] {
  const proof = blocks.filter((b) => b.kind === "proof").sort((a, b) => a.cost - b.cost);
  return [...proof, ...blocks.filter((b) => b.kind !== "proof")];
}

const fmtAmount = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** The line at the top of the phone, for example "A quick first look: 12 s". */
export function phoneLabelText(budgetLabel: string, budget: number, unit: string): string {
  return `${budgetLabel}: ${fmtAmount(budget)} ${unit}`;
}

/** Geometry of the stack in the picture's units, shared by the component and the tests. */
export const STACK_GEO = {
  width: 420,
  phone: { x: 12, w: 318, top: 46, radius: 28 },
  block: { x: 24, w: 294, gap: 8, oneLine: 52, twoLines: 66 },
  firstTop: 96,
  rail: { x: 340, w: 4 },
  pill: { x: 350, w: 64, h: 24 },
} as const;

export type StackRowBox = { id: string; y: number; h: number; lines: string[] };

/** Rows of the stack: label lines and the box each block takes, top to bottom. */
export function stackLayout(blocks: StackBlock[]): StackRowBox[] {
  const g = STACK_GEO.block;
  let y: number = STACK_GEO.firstTop;
  return blocks.map((b) => {
    const lines = wrapWords(b.label, STACK_LABEL_CHARS);
    const h = lines.length > 1 ? g.twoLines : g.oneLine;
    const row = { id: b.id, y, h, lines };
    y += h + g.gap;
    return row;
  });
}

/** Height of the whole picture for a stack, with room for the note under it when any block has one. */
export function stackHeight(blocks: StackBlock[]): number {
  const rows = stackLayout(blocks);
  const last = rows[rows.length - 1];
  const bottom = last ? last.y + last.h : STACK_GEO.firstTop;
  const hasNote = blocks.some((b) => b.note);
  return bottom + (hasNote ? 58 : 20) + 12;
}

export type StackCheckInput = {
  blocks: StackBlock[];
  budget: number;
  unit: string;
  budgetLabel: string;
  goal: number;
  prompt?: string;
  verdicts?: StackVerdicts;
};

/** Problems in a stack that would break the game or the layout. An empty list means the data is fine. */
export function checkStack({ blocks, budget, unit, budgetLabel, goal, prompt, verdicts }: StackCheckInput): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  if (blocks.length < STACK_LIMITS.blocksMin || blocks.length > STACK_LIMITS.blocksMax) problems.push(`${blocks.length} blocks, use ${STACK_LIMITS.blocksMin} to ${STACK_LIMITS.blocksMax}`);
  for (const b of blocks) {
    if (seen.has(b.id)) problems.push(`${b.id}: duplicate id`);
    seen.add(b.id);
    if (!b.label.trim()) problems.push(`${b.id}: empty label`);
    const lines = wrapWords(b.label, STACK_LABEL_CHARS);
    if (lines.length > STACK_LIMITS.labelLines) problems.push(`${b.id}: label wraps to ${lines.length} lines, at most ${STACK_LIMITS.labelLines}`);
    if (lines.some((l) => l.length > STACK_LABEL_CHARS)) problems.push(`${b.id}: a word is longer than a line`);
    if (!Number.isFinite(b.cost) || b.cost <= 0) problems.push(`${b.id}: cost must be more than 0`);
    if (b.note && wrapWords(b.note, STACK_NOTE_CHARS).length > STACK_LIMITS.noteLines) problems.push(`${b.id}: note wraps to more than ${STACK_LIMITS.noteLines} lines`);
  }
  if (!Number.isFinite(budget) || budget <= 0) problems.push("budget must be more than 0");
  if (!unit.trim() || unit.length > STACK_LIMITS.unit) problems.push(`unit must be 1 to ${STACK_LIMITS.unit} characters`);
  if (!budgetLabel.trim() || budgetLabel.length > STACK_LIMITS.budgetLabel) problems.push(`budgetLabel must be 1 to ${STACK_LIMITS.budgetLabel} characters`);
  const phoneLabel = phoneLabelText(budgetLabel, budget, unit);
  if (phoneLabel.length > STACK_LIMITS.phoneLabel) problems.push(`"${phoneLabel}" is ${phoneLabel.length} characters, at most ${STACK_LIMITS.phoneLabel}`);
  if (prompt !== undefined && prompt.length > STACK_LIMITS.verdict) problems.push(`prompt is ${prompt.length} characters, at most ${STACK_LIMITS.verdict}`);
  const proofs = proofCount(blocks);
  if (!Number.isInteger(goal) || goal < 1) problems.push("goal must be a whole number, 1 or more");
  else if (goal > proofs) problems.push(`goal ${goal} is more than the ${proofs} proof blocks`);
  else {
    if (proofSeen(stackRows(bestOrder(blocks), budget)) < goal) problems.push(`goal ${goal} cannot be met in any order within the budget`);
    if (proofSeen(stackRows(blocks, budget)) >= goal) problems.push("the starting order already meets the goal: there is nothing to fix");
  }
  for (let s = 0; s <= proofs; s++) {
    for (const met of [true, false]) {
      const text = verdictText(met, s, goal, verdicts);
      if (text.length > STACK_LIMITS.verdict) problems.push(`verdict "${text}" is ${text.length} characters, at most ${STACK_LIMITS.verdict}`);
    }
  }
  return [...new Set(problems)];
}
