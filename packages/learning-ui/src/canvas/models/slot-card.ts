import { dealOrder, wrapWords } from "./sorter";

// A slot card as a pure model: a claim card has labelled slots (metric,
// before, after, source...) and a pool of chips. Each slot takes exactly one
// right chip; other chips are guesses, adjectives or a tool's estimate that
// fit no slot. A right chip snaps in; a wrong one is refused with a reason
// and goes back to the pool. When every slot is full the card reads as one
// checkable sentence. No React here, so the rules and the layout are tested
// on their own.

export type CardSlot = {
  id: string;
  /** The slot's name on the card, for example "Before". At most 11 characters. */
  label: string;
};

export type SlotChip = {
  id: string;
  /** What the chip says, up to about 36 characters. */
  text: string;
  /** The slot it fills, or null for a chip that fits no slot (a guess, an adjective, an AI estimate). */
  slot: string | null;
  /** Shown when the chip is tried in a slot it does not fit. At most 60 characters. */
  why: string;
};

/** Own wording for the end banner. `many` holds `{n}` for the number of wrong tries; each result at most 38 characters. */
export type SlotVerdicts = { clean: string; one: string; many: string };

export type SlotState = {
  /** Chip ids in the order the pool shows them. */
  order: string[];
  /** The chip in each slot, keyed by slot id. */
  filled: Record<string, string | null>;
  /** The chip picked up, waiting for a slot. */
  selected: string | null;
  /** Wrong tries so far. */
  misses: number;
};

export type SlotOutcome =
  | { kind: "right"; chip: SlotChip; slot: CardSlot }
  | { kind: "wrong"; chip: SlotChip; slot: CardSlot; reason: string }
  | { kind: "ignored" };

export const SLOT_LIMITS = {
  slotsMin: 3,
  slotsMax: 6,
  chipsMin: 5,
  chipsMax: 10,
  why: 60,
  slotLabel: 11,
  cardTitle: 24,
  claim: 44,
  verdict: 38,
  chipLines: 2,
} as const;

/** Characters per line inside a slot box (13 units semibold inside 262 units). */
export const SLOT_CHARS = 36;
/** Characters per line of a half-width pool chip, and of a full-width one. */
export const CHIP_HALF_CHARS = 23;
export const CHIP_WIDE_CHARS = 50;
/** Characters per line of the reason strip and the end note. */
export const SLOT_STRIP_CHARS = 54;
/** Characters per line of the assembled sentence (15 units inside 360 units). */
export const ASSEMBLED_CHARS = 42;

/** Geometry in the picture's units, shared by the component and the tests. */
export const SLOT_GEO = {
  width: 420,
  card: { x: 10, w: 400, top: 46 },
  slot: { labelX: 24, boxX: 112, boxW: 286, h: 44, pitch: 52 },
  chip: { h: 44, pitch: 50, halfW: 185, wideW: 380, left: 20, right: 215 },
  stripH: 38,
  assembledLine: 22,
  noteLine: 18,
} as const;

export function startSlots(slots: CardSlot[], chips: SlotChip[], seed = 1): SlotState {
  const filled: Record<string, string | null> = {};
  for (const s of slots) filled[s.id] = null;
  return { order: dealOrder(chips.map((c) => c.id), seed), filled, selected: null, misses: 0 };
}

export function isPlaced(state: SlotState, chipId: string): boolean {
  return Object.values(state.filled).includes(chipId);
}

/** Pick a chip up, or put it down when it is already picked up. Placed chips are ignored. */
export function selectChip(state: SlotState, chipId: string): SlotState {
  if (isPlaced(state, chipId) || !state.order.includes(chipId)) return state;
  return { ...state, selected: state.selected === chipId ? null : chipId };
}

/** Try a chip (the picked-up one unless given) in a slot. A full slot, an unknown slot or no chip is ignored. */
export function placeChip(state: SlotState, chips: SlotChip[], slots: CardSlot[], slotId: string, chipId = state.selected): { state: SlotState; outcome: SlotOutcome } {
  const chip = chips.find((c) => c.id === chipId);
  const slot = slots.find((s) => s.id === slotId);
  if (!chip || !slot || state.filled[slotId] !== null || isPlaced(state, chip.id)) return { state, outcome: { kind: "ignored" } };
  if (chip.slot === slotId) {
    return { state: { ...state, filled: { ...state.filled, [slotId]: chip.id }, selected: null }, outcome: { kind: "right", chip, slot } };
  }
  return { state: { ...state, selected: null, misses: state.misses + 1 }, outcome: { kind: "wrong", chip, slot, reason: chip.why } };
}

export function filledCount(state: SlotState): number {
  return Object.values(state.filled).filter((v) => v !== null).length;
}

export function isComplete(state: SlotState): boolean {
  return Object.values(state.filled).every((v) => v !== null);
}

export function counterLabel(state: SlotState, slots: CardSlot[]): string {
  return `Checkable parts: ${filledCount(state)} of ${slots.length}`;
}

/** The end banner, at most 38 characters with the default wording. */
export function slotVerdict(state: SlotState, words?: SlotVerdicts): string {
  const n = state.misses;
  if (words) return n === 0 ? words.clean : n === 1 ? words.one : words.many.replace("{n}", String(n));
  if (n === 0) return "Every part checkable, first try";
  return n === 1 ? "Every part checkable, 1 wrong try" : `Every part checkable, ${n} wrong tries`;
}

/** Where the card's slots start: lower when the original claim is shown under the title. */
export function slotsTop(hasClaim: boolean): number {
  return hasClaim ? 108 : 86;
}

export function cardBottom(slots: CardSlot[], hasClaim: boolean): number {
  return slotsTop(hasClaim) + slots.length * SLOT_GEO.slot.pitch + 4;
}

export type ChipBox = { id: string; x: number; y: number; w: number; wide: boolean; lines: string[] };

/**
 * Lay the pool out in two columns. A chip that needs more than two lines at
 * half width takes a full row; it waits for the half row in progress to fill,
 * so the grid has no holes. `top` is where the pool starts.
 */
export function poolLayout(order: string[], chips: SlotChip[], top: number): ChipBox[] {
  const g = SLOT_GEO.chip;
  const byId = new Map(chips.map((c) => [c.id, c]));
  const out: ChipBox[] = [];
  let row = 0;
  let col = 0;
  const pending: SlotChip[] = [];
  const placeWide = (c: SlotChip) => {
    out.push({ id: c.id, x: g.left, y: top + row * g.pitch, w: g.wideW, wide: true, lines: wrapWords(c.text, CHIP_WIDE_CHARS) });
    row += 1;
  };
  for (const id of order) {
    const c = byId.get(id);
    if (!c) continue;
    const half = wrapWords(c.text, CHIP_HALF_CHARS);
    if (half.length > SLOT_LIMITS.chipLines) {
      if (col === 0) placeWide(c);
      else pending.push(c);
      continue;
    }
    out.push({ id: c.id, x: col === 0 ? g.left : g.right, y: top + row * g.pitch, w: g.halfW, wide: false, lines: half });
    col += 1;
    if (col === 2) {
      col = 0;
      row += 1;
      while (pending.length) placeWide(pending.shift()!);
    }
  }
  if (col === 1) {
    col = 0;
    row += 1;
  }
  while (pending.length) placeWide(pending.shift()!);
  return out;
}

/** Rows the pool takes (the same for every deal order, up to which chips go wide). */
export function poolRows(chips: SlotChip[]): number {
  const wide = chips.filter((c) => wrapWords(c.text, CHIP_HALF_CHARS).length > SLOT_LIMITS.chipLines).length;
  return wide + Math.ceil((chips.length - wide) / 2);
}

export type SlotFrame = { top: number; cardBottom: number; stripTop: number; poolTop: number; height: number };

/** The picture's vertical layout. */
export function slotFrame(slots: CardSlot[], chips: SlotChip[], hasClaim: boolean): SlotFrame {
  const bottom = cardBottom(slots, hasClaim);
  const stripTop = bottom + 8;
  const poolTop = stripTop + SLOT_GEO.stripH + 6;
  return { top: SLOT_GEO.card.top, cardBottom: bottom, stripTop, poolTop, height: poolTop + poolRows(chips) * SLOT_GEO.chip.pitch + 6 };
}

export type SlotCheckInput = {
  slots: CardSlot[];
  chips: SlotChip[];
  cardTitle: string;
  assembled: string;
  endNote: string;
  claim?: string;
  prompt?: string;
  verdicts?: SlotVerdicts;
};

/** Problems in a card that would break the game or the layout. An empty list means the data is fine. */
export function checkSlots({ slots, chips, cardTitle, assembled, endNote, claim, prompt, verdicts }: SlotCheckInput): string[] {
  const problems: string[] = [];
  if (slots.length < SLOT_LIMITS.slotsMin || slots.length > SLOT_LIMITS.slotsMax) problems.push(`${slots.length} slots, use ${SLOT_LIMITS.slotsMin} to ${SLOT_LIMITS.slotsMax}`);
  if (chips.length < SLOT_LIMITS.chipsMin || chips.length > SLOT_LIMITS.chipsMax) problems.push(`${chips.length} chips, use ${SLOT_LIMITS.chipsMin} to ${SLOT_LIMITS.chipsMax}`);
  const slotIds = new Set<string>();
  for (const s of slots) {
    if (slotIds.has(s.id)) problems.push(`slot ${s.id}: duplicate id`);
    slotIds.add(s.id);
    if (!s.label.trim() || s.label.length > SLOT_LIMITS.slotLabel) problems.push(`slot ${s.id}: label must be 1 to ${SLOT_LIMITS.slotLabel} characters`);
    const right = chips.filter((c) => c.slot === s.id).length;
    if (right !== 1) problems.push(`slot ${s.id}: ${right} chips fill it, it needs exactly 1`);
  }
  const chipIds = new Set<string>();
  for (const c of chips) {
    if (chipIds.has(c.id)) problems.push(`chip ${c.id}: duplicate id`);
    chipIds.add(c.id);
    if (c.slot !== null && !slotIds.has(c.slot)) problems.push(`chip ${c.id}: unknown slot ${c.slot}`);
    if (!c.why.trim()) problems.push(`chip ${c.id}: no why`);
    if (c.why.length > SLOT_LIMITS.why) problems.push(`chip ${c.id}: why is ${c.why.length} characters, at most ${SLOT_LIMITS.why}`);
    if (!c.text.trim()) problems.push(`chip ${c.id}: empty text`);
    if (wrapWords(c.text, CHIP_WIDE_CHARS).length > SLOT_LIMITS.chipLines) problems.push(`chip ${c.id}: text is too long for a chip`);
    if (c.slot !== null && wrapWords(c.text, SLOT_CHARS).length > SLOT_LIMITS.chipLines) problems.push(`chip ${c.id}: text is too long for its slot`);
  }
  if (!cardTitle.trim() || cardTitle.length > SLOT_LIMITS.cardTitle) problems.push(`cardTitle must be 1 to ${SLOT_LIMITS.cardTitle} characters`);
  if (claim !== undefined && (!claim.trim() || claim.length > SLOT_LIMITS.claim)) problems.push(`claim must be 1 to ${SLOT_LIMITS.claim} characters`);
  if (prompt !== undefined && prompt.length > SLOT_LIMITS.verdict) problems.push(`prompt is ${prompt.length} characters, at most ${SLOT_LIMITS.verdict}`);
  const body = slots.length * SLOT_GEO.slot.pitch - 8;
  const assembledLines = wrapWords(assembled, ASSEMBLED_CHARS).length;
  if (!assembled.trim()) problems.push("assembled is empty");
  else if (assembledLines * SLOT_GEO.assembledLine > body) problems.push(`assembled wraps to ${assembledLines} lines, the card holds ${Math.floor(body / SLOT_GEO.assembledLine)}`);
  const noteRoom = Math.floor((poolRows(chips) * SLOT_GEO.chip.pitch) / SLOT_GEO.noteLine);
  if (wrapWords(endNote, SLOT_STRIP_CHARS).length > noteRoom) problems.push(`endNote wraps to more than ${noteRoom} lines`);
  for (const misses of [0, 1, 9, 10]) {
    const text = slotVerdict({ order: [], filled: {}, selected: null, misses }, verdicts);
    if (text.length > SLOT_LIMITS.verdict) problems.push(`verdict "${text}" is ${text.length} characters, at most ${SLOT_LIMITS.verdict}`);
  }
  return [...new Set(problems)];
}
