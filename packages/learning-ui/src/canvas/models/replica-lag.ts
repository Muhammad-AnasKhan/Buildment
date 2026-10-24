import { createSimulation, roundUp, type Trace, type TraceItem, type TraceStep } from "../sim";

// Amna posts a comment, then refreshes three times. Her write goes to the
// leader, which replicates it asynchronously to a fast replica and a slow
// one. Each refresh is routed by one of three rules. The model counts reads
// that miss her own write (read-your-writes broken) and reads that miss it
// after an earlier read showed it (monotonic reads broken).

export type Routing = "any" | "leader" | "token";
export type LagInputs = { lagMs: number; firstReadMs: number; routing: Routing };

export const LAG_BOUNDS = {
  lagMs: { min: 0, max: 1500, step: 50, default: 600 },
  firstReadMs: { min: 0, max: 1000, step: 50, default: 200 },
} as const;

export const LAG_DEFAULTS: LagInputs = { lagMs: 600, firstReadMs: 200, routing: "any" };

/** Time between Amna's refreshes. */
export const READ_SPACING_MS = 150;
const READS = 3;

type Target = "leader" | "r1" | "r2";
export type LagRead = { at: number; target: Target; saw: boolean; brokeMonotonic: boolean };

export type LagOutcome = {
  inputs: LagInputs;
  fastLagMs: number;
  slowLagMs: number;
  reads: LagRead[];
  missedOwnWrite: number;
  wentBackInTime: number;
  leaderReads: number;
};

function clampStep(value: number, b: { min: number; max: number; step: number }): number {
  if (!Number.isFinite(value)) return b.min;
  return Math.max(b.min, Math.min(b.max, Math.round(value / b.step) * b.step));
}

export function normaliseLag(inputs: LagInputs): LagInputs {
  return {
    lagMs: clampStep(inputs.lagMs, LAG_BOUNDS.lagMs),
    firstReadMs: clampStep(inputs.firstReadMs, LAG_BOUNDS.firstReadMs),
    routing: inputs.routing === "leader" || inputs.routing === "token" ? inputs.routing : "any",
  };
}

export function simulateLag(raw: LagInputs): LagOutcome {
  const inputs = normaliseLag(raw);
  const slowLagMs = inputs.lagMs;
  const fastLagMs = Math.round(inputs.lagMs / 4);
  const sim = createSimulation();
  // Position of the last write each node has applied. The comment is position 1.
  const applied: Record<Target, number> = { leader: 0, r1: 0, r2: 0 };
  const reads: LagRead[] = [];
  const writeToken = 1;

  sim.schedule(0, () => {
    applied.leader = 1;
  });
  // Applies are scheduled before reads, so a replica that catches up at the
  // same moment as a read counts as caught up.
  sim.schedule(fastLagMs, () => {
    applied.r1 = 1;
  });
  sim.schedule(slowLagMs, () => {
    applied.r2 = 1;
  });

  let sawBefore = false;
  for (let k = 0; k < READS; k++) {
    const at = inputs.firstReadMs + k * READ_SPACING_MS;
    sim.schedule(at, () => {
      // "Any replica" takes turns: replica 1, replica 2, replica 1.
      const turn: Target = k % 2 === 0 ? "r1" : "r2";
      let target: Target = turn;
      if (inputs.routing === "leader") target = "leader";
      if (inputs.routing === "token") {
        const order: Target[] = turn === "r1" ? ["r1", "r2"] : ["r2", "r1"];
        target = order.find((node) => applied[node] >= writeToken) ?? "leader";
      }
      const saw = applied[target] >= writeToken;
      reads.push({ at, target, saw, brokeMonotonic: sawBefore && !saw });
      if (saw) sawBefore = true;
    });
  }
  sim.runAll();

  return {
    inputs,
    fastLagMs,
    slowLagMs,
    reads,
    missedOwnWrite: reads.filter((r) => !r.saw).length,
    wentBackInTime: reads.filter((r) => r.brokeMonotonic).length,
    leaderReads: reads.filter((r) => r.target === "leader").length,
  };
}

export const NAMES: Record<Target, string> = { leader: "the leader", r1: "replica 1", r2: "replica 2" };

export function lagTrace(o: LagOutcome): Trace {
  // Events in time order; on a tie an apply comes before a read, as in the model.
  type Ev = { at: number; kind: "apply" | "read"; node?: "r1" | "r2"; read?: LagRead; index?: number };
  const events: Ev[] = [
    { at: o.fastLagMs, kind: "apply" as const, node: "r1" as const },
    { at: o.slowLagMs, kind: "apply" as const, node: "r2" as const },
    ...o.reads.map((read, index) => ({ at: read.at, kind: "read" as const, read, index })),
  ].sort((a, b) => a.at - b.at || (a.kind === b.kind ? 0 : a.kind === "apply" ? -1 : 1));

  const items: TraceItem[] = [
    { kind: "message", from: "client", to: "leader", sentAt: 0, receivedAt: 0, label: "", step: 0 },
    { kind: "point", lane: "leader", at: 0, label: "comment saved", tone: "good", labelRow: 1, step: 0 },
  ];
  if (o.fastLagMs > 0) items.push({ kind: "span", lane: "r1", from: 0, to: o.fastLagMs, label: "no comment yet", tone: "warn", step: 0 });
  if (o.slowLagMs > 0) items.push({ kind: "span", lane: "r2", from: 0, to: o.slowLagMs, label: "no comment yet", tone: "warn", step: 0 });

  const steps: TraceStep[] = [
    {
      title: "Amna posts a comment",
      note: `The write goes to the leader and is saved at once. The leader sends it to both replicas in the background. Replica 1 is ${o.fastLagMs} ms behind; replica 2 is ${o.slowLagMs} ms behind.`,
      tone: "good",
    },
  ];

  events.forEach((ev, i) => {
    const step = i + 1;
    if (ev.kind === "apply" && ev.node) {
      // The "no comment yet" bar ends where the replica catches up, so these need no label of their own.
      items.push({ kind: "message", from: "leader", to: ev.node, sentAt: 0, receivedAt: ev.at, label: "", tone: "accent", step });
      items.push({ kind: "point", lane: ev.node, at: ev.at, label: "", tone: "good", step });
      steps.push({ title: `${cap(NAMES[ev.node])} catches up`, note: `At ${ev.at} ms ${NAMES[ev.node]} applies the comment. Reads sent there from now on will show it.` });
      return;
    }
    const read = ev.read!;
    const n = (ev.index ?? 0) + 1;
    items.push({ kind: "message", from: "client", to: read.target, sentAt: read.at, receivedAt: read.at, label: "", tone: read.saw ? "good" : "bad", step });
    // Only the refresh number fits on a phone; the canvas lists each refresh in words below the timeline.
    items.push({ kind: "point", lane: read.target, at: read.at, label: String(n), tone: read.saw ? "good" : "bad", step });
    const why =
      o.inputs.routing === "leader"
        ? "Her reads go to the leader, which always has her own writes."
        : o.inputs.routing === "token" && read.target === "leader"
          ? "Her app carries the position of her last write. No replica has reached it yet, so the read falls back to the leader."
          : o.inputs.routing === "token"
            ? `Her app carries the position of her last write, and ${NAMES[read.target]} has reached it.`
            : `The router takes turns between replicas, so this refresh goes to ${NAMES[read.target]}.`;
    steps.push(
      read.saw
        ? { title: `Refresh ${n} shows the comment`, note: `${why} The comment is there.`, tone: "good", outcome: "sees own write" }
        : {
            title: `Refresh ${n} misses the comment`,
            note: `${why} ${cap(NAMES[read.target])} has not applied the comment yet, so Amna's own comment is missing.${read.brokeMonotonic ? " She saw it a moment ago, so the page went back in time: monotonic reads are broken too." : " Read-your-writes is broken."}`,
            tone: "bad",
            outcome: read.brokeMonotonic ? "went back in time" : "missed own write",
          }
    );
  });

  const lastRead = o.reads[o.reads.length - 1]?.at ?? 0;
  return {
    unit: "ms",
    range: [0, roundUp(Math.max(o.slowLagMs, lastRead) + 100, 200)],
    lanes: [
      { id: "client", label: "Amna's app" },
      { id: "leader", label: "Leader" },
      { id: "r1", label: "Replica 1", sublabel: `${o.fastLagMs} ms behind` },
      { id: "r2", label: "Replica 2", sublabel: `${o.slowLagMs} ms behind` },
    ],
    items,
    steps,
  };
}

export function describeLagChange(before: LagInputs, after: LagInputs): string {
  const a = simulateLag(before);
  const b = simulateLag(after);
  const what: string[] = [];
  if (a.inputs.lagMs !== b.inputs.lagMs) what.push(`the slow replica's lag from ${a.inputs.lagMs} to ${b.inputs.lagMs} ms`);
  if (a.inputs.firstReadMs !== b.inputs.firstReadMs) what.push(`the first refresh from ${a.inputs.firstReadMs} to ${b.inputs.firstReadMs} ms`);
  if (a.inputs.routing !== b.inputs.routing) what.push(`routing to "${ROUTING_LABEL[b.inputs.routing]}"`);
  if (what.length === 0) return "";
  return `You changed ${what.join(" and ")}. Missed own write: ${a.missedOwnWrite} to ${b.missedOwnWrite} of 3 refreshes. Went back in time: ${a.wentBackInTime} to ${b.wentBackInTime}. Reads on the leader: ${a.leaderReads} to ${b.leaderReads}.`;
}

export const ROUTING_LABEL: Record<Routing, string> = {
  any: "Any replica",
  leader: "Leader for own reads",
  token: "Replica at my position",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
