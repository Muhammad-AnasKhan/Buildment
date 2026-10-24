// 14.5 beat "Count the copies, with and without a table": 100 messages reach a
// consumer that applies an effect for each. Pure model, no React. a is the
// chance an ack is lost after the work (the message comes again); c is the
// chance the consumer crashes between the work and the record of the id.
// Expected values come from a geometric series: each attempt that applies the
// effect without being stopped has a fixed chance of being followed by another.

export const N = 100;

export type Consumer = "none" | "separate" | "same";

export const CONSUMERS: readonly { id: Consumer; text: string; label: string }[] = [
  { id: "none", text: "No dedupe", label: "No dedupe" },
  { id: "separate", text: "Separate table", label: "Dedupe table in a separate step" },
  { id: "same", text: "Same transaction", label: "Id saved in the same transaction" },
];

/** Ack lost, as a share (0 to 1), and gap crash. Snap points. */
export const ACK_SNAPS = [0, 0.05, 0.1, 0.2, 0.4] as const;
export const GAP_SNAPS = [0, 0.02, 0.05, 0.1] as const;
export const DEFAULTS = { consumer: "none" as Consumer, ack: 0.2, gap: 0.05 };

/** The gap rail only matters for the separate table. */
export const gapUsed = (c: Consumer) => c === "separate";

export const percent = (v: number) => `${Math.round(v * 100)}%`;

export function snapTo(snaps: readonly number[], v: number): number {
  let best = snaps[0];
  for (const s of snaps) if (Math.abs(s - v) < Math.abs(best - v)) best = s;
  return best;
}

/** Expected effects applied for N messages. */
export function effects(consumer: Consumer, a: number, c: number, n = N): number {
  if (consumer === "none") return n / (1 - a);
  if (consumer === "separate") return n / (1 - c);
  return n;
}

/** Expected deliveries: every lost ack brings the message again, and a crash in the gap does too. */
export function deliveries(consumer: Consumer, a: number, c: number, n = N): number {
  if (consumer === "separate") return n / (1 - a - c);
  return n / (1 - a);
}

export type DotKind = "original" | "copy" | "copy-hit";

export type Flow = {
  consumer: Consumer;
  a: number;
  c: number;
  /** The gap chance actually in force (0 unless the separate table is picked). */
  gap: number;
  effects: number;
  extra: number;
  /** Rounded counts for the picture. */
  effectsShown: number;
  extraShown: number;
  copiesShown: number;
  /** Copies that are applied again (outlined) and copies that are skipped (light). */
  hitsShown: number;
  dots: DotKind[];
  verdict: { text: string; tone: "good" | "warn" | "bad" };
};

/** N original dots with copies spread evenly among them; some copies are the ones that get applied. */
export function layoutDots(n: number, copies: number, hits: number): DotKind[] {
  const out: DotKind[] = [];
  const total = Math.max(0, copies);
  const hitCount = Math.max(0, Math.min(total, hits));
  let placed = 0;
  for (let i = 0; i < n; i++) {
    out.push("original");
    const due = Math.floor(((i + 1) * total) / n);
    while (placed < due) {
      // Spread the applied copies evenly among all copies.
      const hitsDue = Math.floor(((placed + 1) * hitCount) / Math.max(1, total));
      const hitsSoFar = out.filter((d) => d === "copy-hit").length;
      out.push(hitsDue > hitsSoFar ? "copy-hit" : "copy");
      placed++;
    }
  }
  return out;
}

export function verdictFor(consumer: Consumer, a: number, extraShown: number): { text: string; tone: "good" | "warn" | "bad" } {
  if (consumer === "none") return a === 0 ? { text: "No copies, no harm", tone: "good" } : { text: `Every copy counts: ${extraShown} extra`, tone: "bad" };
  if (consumer === "separate") return extraShown === 0 ? { text: "Fine until a crash hits the gap", tone: "warn" } : { text: `The crash gap lets ${extraShown} through`, tone: "bad" };
  return { text: `Exactly ${N} effects at any chance`, tone: "good" };
}

export function flow(consumer: Consumer, aIn: number, cIn: number): Flow {
  const a = snapTo(ACK_SNAPS, aIn);
  const gap = gapUsed(consumer) ? snapTo(GAP_SNAPS, cIn) : 0;
  const c = snapTo(GAP_SNAPS, cIn);
  const e = effects(consumer, a, gap);
  const d = deliveries(consumer, a, gap);
  const effectsShown = Math.round(e);
  const extraShown = effectsShown - N;
  const copiesShown = Math.max(extraShown, Math.round(d) - N);
  const dots = layoutDots(N, copiesShown, extraShown);
  return {
    consumer,
    a,
    c,
    gap,
    effects: e,
    extra: e - N,
    effectsShown,
    extraShown,
    copiesShown,
    hitsShown: extraShown,
    dots,
    verdict: verdictFor(consumer, a, extraShown),
  };
}

export function flowSummary(f: Flow): string {
  const who = CONSUMERS.find((o) => o.id === f.consumer)?.label ?? "";
  return `${who}. Ack lost ${percent(f.a)}${f.consumer === "separate" ? `, crash in the gap ${percent(f.gap)}` : ""}. ${f.copiesShown} copies arrive. ${f.effectsShown} effects applied, ${N} expected, ${f.extraShown} extra. ${f.verdict.text}.`;
}
