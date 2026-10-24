// 14.3 beat "Fail a step and watch the undo": a four-step order saga. Pure
// model, no React. When a step fails, the saga runs the undo of every finished
// step that has one, newest first. The last step (send receipt) has no undo:
// it is retried until it works. With undo steps off, finished steps stay.

export type StepId = 1 | 2 | 3 | 4;
export type Fail = 0 | StepId; // 0 = no step fails

export const PRICE = 18;

export type Step = { id: StepId; action: string; lines: readonly [string, string]; undo: string | null; undoLines: readonly [string, string] | null };

export const STEPS: readonly Step[] = [
  { id: 1, action: "Reserve stock", lines: ["Reserve", "stock"], undo: "Release stock", undoLines: ["Release", "stock"] },
  { id: 2, action: "Charge card (18)", lines: ["Charge", "card (18)"], undo: "Refund card", undoLines: ["Refund", "card"] },
  { id: 3, action: "Book courier", lines: ["Book", "courier"], undo: "Cancel booking", undoLines: ["Cancel", "booking"] },
  { id: 4, action: "Send receipt", lines: ["Send", "receipt"], undo: null, undoLines: null },
];

export const FAIL_OPTIONS: readonly { id: Fail; text: string; label: string }[] = [
  { id: 1, text: "Step 1", label: "Step 1 fails" },
  { id: 2, text: "Step 2", label: "Step 2 fails" },
  { id: 3, text: "Step 3", label: "Step 3 fails" },
  { id: 4, text: "Step 4", label: "Step 4 fails" },
  { id: 0, text: "None fail", label: "No step fails" },
];

export const DEFAULTS = { fail: 3 as Fail, undoOn: true };

export type CardState = "done" | "failed" | "skipped";
export type Tone = "good" | "warn" | "bad" | "accent";

export type SagaState = {
  fail: Fail;
  undoOn: boolean;
  /** Steps whose action ran and committed, in order. */
  ran: StepId[];
  /** Per step, what the card shows. */
  cards: Record<StepId, CardState>;
  /** Steps that are undone, in the order the undo steps run (newest first). */
  undone: StepId[];
  /** Step 4 failed: the receipt is retried, not undone. */
  retry: boolean;
  /** Net amount taken from Layla's card. */
  cardNet: number;
  stockHeld: boolean;
  courierBooked: boolean;
  /** True when the end state is a whole order or no order, and not a half-done one. */
  consistent: boolean;
  verdict: { text: string; tone: Tone };
};

export function sagaState(failIn: number, undoOn: boolean): SagaState {
  const fail = ([0, 1, 2, 3, 4].includes(failIn) ? failIn : 0) as Fail;
  const ran = STEPS.filter((s) => (fail === 0 ? true : s.id < fail)).map((s) => s.id);
  const cards = {} as Record<StepId, CardState>;
  for (const s of STEPS) cards[s.id] = fail === 0 || s.id < fail ? "done" : s.id === fail ? "failed" : "skipped";
  // Step 4 failing is never undone: nothing is rolled back, the receipt is retried.
  const undone: StepId[] = undoOn && fail >= 1 && fail <= 3 ? ([...ran].reverse().filter((id) => STEPS[id - 1].undo !== null) as StepId[]) : [];
  const retry = fail === 4;
  const has = (id: StepId) => ran.includes(id) && !undone.includes(id);
  const cardNet = has(2) ? PRICE : 0;
  const stockHeld = has(1);
  const courierBooked = has(3);
  const complete = fail === 0 || fail === 4;
  const consistent = complete || (!stockHeld && cardNet === 0 && !courierBooked);
  return {
    fail,
    undoOn,
    ran,
    cards,
    undone,
    retry,
    cardNet,
    stockHeld,
    courierBooked,
    consistent,
    verdict: sagaVerdict(fail, undoOn),
  };
}

export function sagaVerdict(fail: Fail, undoOn: boolean): { text: string; tone: Tone } {
  if (fail === 0) return { text: "All four steps committed", tone: "good" };
  if (fail === 1) return { text: "Nothing to undo: step 1 failed", tone: "good" };
  if (fail === 4) return { text: "No undo: retry the receipt", tone: "warn" };
  if (undoOn) return fail === 2 ? { text: "1 undo step: release the stock", tone: "good" } : { text: "2 undo steps, newest first", tone: "good" };
  return fail === 2 ? { text: "Stock held, no order", tone: "bad" } : { text: "Card charged, stock held, no order", tone: "bad" };
}

/** Text for the two counters under the cards. */
export function cardCounter(s: SagaState): string {
  return `Card: net ${s.cardNet}`;
}
export function stockCounter(s: SagaState): string {
  return `Stock: ${s.stockHeld ? "held" : "free"}`;
}

/** Plain-words summary for screen readers. */
export function sagaSummary(s: SagaState): string {
  const ran = s.ran.length ? s.ran.map((id) => STEPS[id - 1].action).join(", ") : "none";
  const undo = s.undone.length ? s.undone.map((id) => STEPS[id - 1].undo).join(", then ") : s.retry ? "none, the receipt is retried" : "none";
  return `Steps that ran: ${ran}. Undo steps, in order: ${undo}. ${cardCounter(s)}. ${stockCounter(s)}. ${s.verdict.text}.`;
}
