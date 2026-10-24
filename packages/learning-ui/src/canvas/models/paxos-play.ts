// Single-decree Paxos with two proposers and three acceptors (12.7 beat 2).
// Pure rules, no React. Each acceptor keeps promised, and the proposal it
// accepted (number and value). prepare(n): if n is above promised, promise
// and report the accepted proposal; otherwise refuse. accept(n, v): if n is at
// least promised, accept; otherwise refuse. A proposer may send accept only
// after promises from a majority (2 of 3), and its value is the value of the
// highest numbered proposal reported in those promises, or its own value.

export type ProposerId = "P1" | "P2";
export type AcceptorId = "A1" | "A2" | "A3";
export type Value = "A" | "B";

export const PROPOSERS: readonly ProposerId[] = ["P1", "P2"];
export const ACCEPTORS: readonly AcceptorId[] = ["A1", "A2", "A3"];
/** P1 uses odd numbers and wants A; P2 uses even numbers and wants B. */
export const NUMBERS: Record<ProposerId, readonly number[]> = { P1: [1, 3, 5], P2: [2, 4, 6] };
export const WANTS: Record<ProposerId, Value> = { P1: "A", P2: "B" };
export const MAJORITY = 2;
export const MAX_ACTIONS = 30;

export type Proposal = { n: number; v: Value };
export type AcceptorState = { promised: number | null; accepted: Proposal | null };
/** The promises a proposer holds for its current number; a null report means "nothing accepted yet". */
export type Round = { n: number; promises: Partial<Record<AcceptorId, Proposal | null>> };
export type ActionKind = "prepare" | "accept";
export type Action = { who: ProposerId; kind: ActionKind; to: AcceptorId[] };

export type PaxosState = {
  acceptors: Record<AcceptorId, AcceptorState>;
  rounds: Record<ProposerId, Round | null>;
  /** How many of the proposer's numbers it has used. */
  used: Record<ProposerId, number>;
  /** Every value that a majority has ever accepted under one proposal. */
  chosen: Value[];
  /** Actions in which at least one acceptor refused. */
  refused: number;
  actions: Action[];
};

export type Reply = {
  to: AcceptorId;
  ok: boolean;
  /** On a refusal, the number the acceptor had promised. */
  promised: number | null;
  /** On a promise, the proposal the acceptor had already accepted. */
  report: Proposal | null;
};

export type Step = {
  state: PaxosState;
  who: ProposerId;
  kind: ActionKind;
  n: number;
  /** The value sent, for an accept. */
  value: Value | null;
  replies: Reply[];
  newlyChosen: Value | null;
};

export function startPaxos(): PaxosState {
  return {
    acceptors: {
      A1: { promised: null, accepted: null },
      A2: { promised: null, accepted: null },
      A3: { promised: null, accepted: null },
    },
    rounds: { P1: null, P2: null },
    used: { P1: 0, P2: 0 },
    chosen: [],
    refused: 0,
    actions: [],
  };
}

export const nextNumber = (s: PaxosState, who: ProposerId): number | null => NUMBERS[who][s.used[who]] ?? null;
export const promiseCount = (s: PaxosState, who: ProposerId): number => Object.keys(s.rounds[who]?.promises ?? {}).length;
export const hasMajority = (s: PaxosState, who: ProposerId): boolean => promiseCount(s, who) >= MAJORITY;
export const full = (s: PaxosState): boolean => s.actions.length >= MAX_ACTIONS;

export type Forced = {
  value: Value;
  /** True when a promise reported an accepted proposal, so the proposer has no choice. */
  locked: boolean;
  /** The acceptor whose report decided it, and what it reported. */
  from?: AcceptorId;
  report?: Proposal;
};

/** What the proposer must send in accept, or null while it has no majority of promises. */
export function proposalValue(s: PaxosState, who: ProposerId): Forced | null {
  const round = s.rounds[who];
  if (!round || !hasMajority(s, who)) return null;
  let best: { from: AcceptorId; report: Proposal } | null = null;
  for (const id of ACCEPTORS) {
    const report = round.promises[id];
    if (report && (!best || report.n > best.report.n)) best = { from: id, report };
  }
  return best ? { value: best.report.v, locked: true, from: best.from, report: best.report } : { value: WANTS[who], locked: false };
}

export const canPrepare = (s: PaxosState, who: ProposerId, to: readonly AcceptorId[]) => !full(s) && nextNumber(s, who) !== null && to.length > 0;
export const canAccept = (s: PaxosState, who: ProposerId, to: readonly AcceptorId[]) => !full(s) && hasMajority(s, who) && to.length > 0;

function pairs(s: PaxosState): Value[] {
  const count = new Map<string, { v: Value; k: number }>();
  for (const id of ACCEPTORS) {
    const a = s.acceptors[id].accepted;
    if (!a) continue;
    const key = `${a.n}${a.v}`;
    count.set(key, { v: a.v, k: (count.get(key)?.k ?? 0) + 1 });
  }
  return [...count.values()].filter((c) => c.k >= MAJORITY).map((c) => c.v);
}

/** The most acceptors that hold one proposal under the given value. */
export function holders(s: PaxosState, v: Value): number {
  const count = new Map<number, number>();
  for (const id of ACCEPTORS) {
    const a = s.acceptors[id].accepted;
    if (a && a.v === v) count.set(a.n, (count.get(a.n) ?? 0) + 1);
  }
  return Math.max(0, ...count.values());
}

function finish(prev: PaxosState, next: PaxosState, who: ProposerId, kind: ActionKind, n: number, value: Value | null, replies: Reply[], to: readonly AcceptorId[]): Step {
  const chosen = [...next.chosen];
  let newlyChosen: Value | null = null;
  for (const v of pairs(next)) {
    if (!chosen.includes(v)) {
      chosen.push(v);
      newlyChosen = v;
    }
  }
  const state: PaxosState = {
    ...next,
    chosen,
    refused: next.refused + (replies.some((r) => !r.ok) ? 1 : 0),
    actions: [...prev.actions, { who, kind, to: [...to] }],
  };
  return { state, who, kind, n, value, replies, newlyChosen };
}

export function prepare(s: PaxosState, who: ProposerId, to: readonly AcceptorId[]): Step | null {
  if (!canPrepare(s, who, to)) return null;
  const n = nextNumber(s, who) as number;
  const acceptors = { ...s.acceptors };
  const promises: Round["promises"] = {};
  const replies: Reply[] = [];
  for (const id of ACCEPTORS) {
    if (!to.includes(id)) continue;
    const a = acceptors[id];
    if (a.promised === null || n > a.promised) {
      acceptors[id] = { ...a, promised: n };
      promises[id] = a.accepted;
      replies.push({ to: id, ok: true, promised: n, report: a.accepted });
    } else {
      replies.push({ to: id, ok: false, promised: a.promised, report: null });
    }
  }
  const next: PaxosState = { ...s, acceptors, rounds: { ...s.rounds, [who]: { n, promises } }, used: { ...s.used, [who]: s.used[who] + 1 } };
  return finish(s, next, who, "prepare", n, null, replies, to);
}

export function accept(s: PaxosState, who: ProposerId, to: readonly AcceptorId[]): Step | null {
  if (!canAccept(s, who, to)) return null;
  const round = s.rounds[who] as Round;
  const { value } = proposalValue(s, who) as Forced;
  const acceptors = { ...s.acceptors };
  const replies: Reply[] = [];
  for (const id of ACCEPTORS) {
    if (!to.includes(id)) continue;
    const a = acceptors[id];
    if (a.promised === null || round.n >= a.promised) {
      acceptors[id] = { promised: round.n, accepted: { n: round.n, v: value } };
      replies.push({ to: id, ok: true, promised: round.n, report: null });
    } else {
      replies.push({ to: id, ok: false, promised: a.promised, report: null });
    }
  }
  return finish(s, { ...s, acceptors }, who, "accept", round.n, value, replies, to);
}

export const proposalText = (p: Proposal | null) => (p ? `(${p.n}, ${p.v})` : "nothing");

/** One plain sentence for a step, for the list under the picture and the live region. */
export function describeStep(step: Step): string {
  const sent = step.kind === "prepare" ? `Prepare ${step.n}` : `Accept ${step.n}, ${step.value}`;
  const to = step.replies.map((r) => r.to).join(", ");
  const answers = step.replies
    .map((r) => {
      if (!r.ok) return `${r.to} refused (promised ${r.promised})`;
      if (step.kind === "accept") return `${r.to} accepted`;
      return r.report ? `${r.to} promised and reported ${proposalText(r.report)}` : `${r.to} promised`;
    })
    .join("; ");
  return `${step.who} sent ${sent} to ${to}: ${answers}.`;
}

/** The text state of one acceptor, for screen readers. */
export function acceptorText(s: PaxosState, id: AcceptorId): string {
  const a = s.acceptors[id];
  return `${id}: promised ${a.promised ?? "nothing"}, accepted ${a.accepted ? `${a.accepted.n} ${a.accepted.v}` : "nothing"}`;
}

export type Verdict = { text: string; tone: "accent" | "good" | "warn" | "bad" };

/** The banner words for the last step, 38 characters or fewer. */
export function stepVerdict(step: Step | null): Verdict {
  if (!step) return { text: "Pick a proposer, then Prepare", tone: "accent" };
  if (step.kind === "accept" && step.newlyChosen) {
    return { text: `${step.newlyChosen} is chosen: ${holders(step.state, step.newlyChosen)} of 3 accepted it`, tone: "good" };
  }
  const refusals = step.replies.filter((r) => !r.ok);
  if (refusals.length > 0) {
    const top = Math.max(...refusals.map((r) => r.promised ?? 0));
    return { text: `Refused: promised ${top}`, tone: "bad" };
  }
  if (step.kind === "accept") {
    const [first] = step.state.chosen;
    if (first) return { text: `Still one value: ${first}`, tone: "good" };
    return { text: `Only ${step.replies.length} of 3 accepted: not chosen`, tone: "warn" };
  }
  const promises = Object.keys(step.state.rounds[step.who]?.promises ?? {}).length;
  if (promises < MAJORITY) return { text: `No majority: ${step.who} must wait`, tone: "warn" };
  const forced = proposalValue(step.state, step.who) as Forced;
  if (forced.locked) {
    return forced.value === WANTS[step.who]
      ? { text: `${step.who} keeps ${forced.value}: it was accepted`, tone: "warn" }
      : { text: `${step.who} must propose ${forced.value}, not ${WANTS[step.who]}`, tone: "warn" };
  }
  return { text: "Majority promised: now send Accept", tone: "accent" };
}

/** The line beside the value box, saying why the value is what it is. */
export function valueNote(s: PaxosState, who: ProposerId): string {
  const round = s.rounds[who];
  if (!round) return "Accept needs promises from 2 of 3";
  const k = promiseCount(s, who);
  if (k < MAJORITY) return `${k} ${k === 1 ? "promise" : "promises"}: wait for a majority`;
  const forced = proposalValue(s, who) as Forced;
  if (forced.locked && forced.from && forced.report) return `${forced.from} reported ${proposalText(forced.report)}: ${who} must propose ${forced.value}`;
  return `Nothing reported: ${who} may propose ${forced.value}`;
}

export const DUEL_REFUSALS = 2;
export const DUEL_HINT = "Two proposers can keep outbidding";

// The scripted run from the chapter's predict.
export type ScriptStep = { who: ProposerId; kind: ActionKind; to: readonly AcceptorId[]; text: string };

export const SCRIPT: readonly ScriptStep[] = [
  { who: "P1", kind: "prepare", to: ["A1", "A2", "A3"], text: "P1 taps Prepare 1, with all three acceptors on" },
  { who: "P1", kind: "accept", to: ["A1", "A2"], text: "P1 turns A3 off, then taps Accept 1, A" },
  { who: "P2", kind: "prepare", to: ["A2", "A3"], text: "Tap P2, turn A1 off, then tap Prepare 2" },
  { who: "P2", kind: "accept", to: ["A2", "A3"], text: "P2 sees A in a promise and must send A. Tap Accept" },
];

const sameTargets = (a: readonly AcceptorId[], b: readonly AcceptorId[]) => a.length === b.length && b.every((id) => a.includes(id));

/** How many scripted steps the learner's actions match, from the start. */
export function scriptProgress(actions: readonly Action[]): number {
  let i = 0;
  while (i < SCRIPT.length && i < actions.length) {
    const a = actions[i];
    const s = SCRIPT[i];
    if (a.who !== s.who || a.kind !== s.kind || !sameTargets(a.to, s.to)) break;
    i++;
  }
  return i;
}

/** What to do next: the scripted step while the learner is on it, else a free-play hint. */
export function guide(s: PaxosState): { text: string; step: number | null } {
  const progress = scriptProgress(s.actions);
  if (progress === s.actions.length) {
    if (progress < SCRIPT.length) return { text: `Step ${progress + 1} of ${SCRIPT.length}: ${SCRIPT[progress].text}.`, step: progress };
    return { text: "All three hold A and only A is chosen. Tap Reset and try the duel: Prepare for both, then P1 Accept.", step: null };
  }
  if (s.refused >= DUEL_REFUSALS) return { text: "Each higher Prepare cancels the other's Accept. Tap Reset to start again.", step: null };
  return { text: "Free play. Try P2 with only A3 on: one promise is not a majority. Reset restarts the steps.", step: null };
}

export function stateKey(s: PaxosState): string {
  return JSON.stringify([s.acceptors, s.rounds, s.used, s.chosen]);
}
