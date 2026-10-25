// 14.4 beat "Crash between the two writes": three ways to save an order and
// announce it, and the crash points that matter. Pure model, no React. For one
// order the model lists the steps that play (lane, row, words, arrows), where
// the crash cuts the run, how many events reach the broker and whether the
// order exists.

export type Approach = "save-first" | "publish-first" | "outbox";
export type Crash = "none" | "between" | "after-publish";
export type Lane = "app" | "db" | "relay" | "broker";
export type Tone = "good" | "warn" | "bad" | "accent";

export const APPROACHES: readonly { id: Approach; text: string; label: string }[] = [
  { id: "save-first", text: "Save first", label: "Save, then publish" },
  { id: "publish-first", text: "Publish first", label: "Publish, then save" },
  { id: "outbox", text: "Outbox", label: "Outbox and relay" },
];

export const CRASHES: readonly { id: Crash; text: string; label: string }[] = [
  { id: "none", text: "No crash", label: "No crash" },
  { id: "between", text: "In between", label: "Crash between the two steps" },
  { id: "after-publish", text: "After publish", label: "Crash after publishing, before marking sent" },
];

export const DEFAULTS = { approach: "save-first" as Approach, crash: "between" as Crash };

/** The third crash point exists only where a relay publishes and then marks the row sent. */
export const crashAllowed = (approach: Approach, crash: Crash) => crash !== "after-publish" || approach === "outbox";
export const fitCrash = (approach: Approach, crash: Crash): Crash => (crashAllowed(approach, crash) ? crash : "between");

export const lanesFor = (approach: Approach): Lane[] => (approach === "outbox" ? ["app", "db", "relay", "broker"] : ["app", "db", "broker"]);

export type Step = {
  id: string;
  lane: Lane;
  row: number;
  text: string;
  /** "cross" is the crash mark; "quiet" is a faint note such as "runs later". */
  kind: "step" | "cross" | "quiet";
  tone?: Tone;
  /** An arrow runs from this earlier step to this one. */
  from?: string;
};

export type Run = {
  approach: Approach;
  crash: Crash;
  lanes: Lane[];
  steps: Step[];
  rows: number;
  events: number;
  orderSaved: boolean;
  verdict: { text: string; tone: Tone };
};

export const MAX_ROWS = 6;

function stepsFor(approach: Approach, crash: Crash): Step[] {
  const cut = crash === "between";
  if (approach === "save-first") {
    const s: Step[] = [
      { id: "save", lane: "app", row: 0, text: "save order", kind: "step" },
      { id: "row", lane: "db", row: 0, text: "order row", kind: "step", from: "save" },
    ];
    if (cut) return [...s, { id: "x", lane: "app", row: 1, text: "crash", kind: "cross", tone: "bad" }];
    return [...s, { id: "pub", lane: "app", row: 1, text: "publish", kind: "step" }, { id: "ev", lane: "broker", row: 1, text: "event", kind: "step", from: "pub" }];
  }
  if (approach === "publish-first") {
    const s: Step[] = [
      { id: "pub", lane: "app", row: 0, text: "publish", kind: "step" },
      { id: "ev", lane: "broker", row: 0, text: cut ? "ghost event" : "event", kind: "step", from: "pub", tone: cut ? "bad" : undefined },
    ];
    if (cut) return [...s, { id: "x", lane: "app", row: 1, text: "crash", kind: "cross", tone: "bad" }];
    return [...s, { id: "save", lane: "app", row: 1, text: "save order", kind: "step" }, { id: "row", lane: "db", row: 1, text: "order row", kind: "step", from: "save" }];
  }
  const commit: Step[] = [
    { id: "commit", lane: "app", row: 0, text: "commit", kind: "step" },
    { id: "row", lane: "db", row: 0, text: "order + row", kind: "step", from: "commit" },
  ];
  if (crash === "between") {
    return [
      ...commit,
      { id: "x", lane: "app", row: 1, text: "crash", kind: "cross", tone: "bad" },
      { id: "later", lane: "relay", row: 1, text: "runs later", kind: "quiet" },
      { id: "read", lane: "relay", row: 2, text: "read row", kind: "step", from: "row" },
      { id: "pub", lane: "relay", row: 3, text: "publish", kind: "step" },
      { id: "ev", lane: "broker", row: 3, text: "event", kind: "step", from: "pub" },
      { id: "mark", lane: "relay", row: 4, text: "mark sent", kind: "step" },
      { id: "sent", lane: "db", row: 4, text: "row sent", kind: "step", from: "mark" },
    ];
  }
  const head: Step[] = [
    ...commit,
    { id: "read", lane: "relay", row: 1, text: "read row", kind: "step", from: "row" },
    { id: "pub", lane: "relay", row: 2, text: "publish", kind: "step" },
    { id: "ev", lane: "broker", row: 2, text: "event", kind: "step", from: "pub" },
  ];
  if (crash === "none") {
    return [...head, { id: "mark", lane: "relay", row: 3, text: "mark sent", kind: "step" }, { id: "sent", lane: "db", row: 3, text: "row sent", kind: "step", from: "mark" }];
  }
  return [
    ...head,
    { id: "x", lane: "relay", row: 3, text: "crash", kind: "cross", tone: "bad" },
    { id: "pub2", lane: "relay", row: 4, text: "publish", kind: "step", tone: "warn" },
    { id: "ev2", lane: "broker", row: 4, text: "copy", kind: "step", from: "pub2", tone: "warn" },
    { id: "mark", lane: "relay", row: 5, text: "mark sent", kind: "step" },
    { id: "sent", lane: "db", row: 5, text: "row sent", kind: "step", from: "mark" },
  ];
}

export function verdictFor(approach: Approach, crash: Crash): { text: string; tone: Tone } {
  if (crash === "none") return { text: "One event, one order", tone: "good" };
  if (approach === "save-first") return { text: "Order saved, event lost", tone: "bad" };
  if (approach === "publish-first") return { text: "Event for an order that is not there", tone: "bad" };
  if (crash === "between") return { text: "Event sent later: nothing lost", tone: "good" };
  return { text: "Sent twice: the consumer must cope", tone: "warn" };
}

export function outboxRun(approachIn: Approach, crashIn: Crash): Run {
  const approach = approachIn;
  const crash = fitCrash(approach, crashIn);
  const steps = stepsFor(approach, crash);
  const events = steps.filter((s) => s.lane === "broker" && s.kind === "step").length;
  const orderSaved = !(approach === "publish-first" && crash === "between");
  const rows = Math.max(...steps.map((s) => s.row)) + 1;
  return { approach, crash, lanes: lanesFor(approach), steps, rows, events, orderSaved, verdict: verdictFor(approach, crash) };
}

export const LANE_NAMES: Record<Lane, string> = { app: "App", db: "Database", relay: "Relay", broker: "Broker" };

export const eventsText = (n: number) => `${n} event${n === 1 ? "" : "s"}`;
export const orderText = (saved: boolean) => (saved ? "order saved" : "no order");

export function runSummary(r: Run): string {
  const where = r.crash === "none" ? "No crash" : r.crash === "between" ? "Crash between the two steps" : "Crash after publishing, before marking sent";
  return `${where}. ${eventsText(r.events)} reach the broker, ${orderText(r.orderSaved)}. ${r.verdict.text}.`;
}
