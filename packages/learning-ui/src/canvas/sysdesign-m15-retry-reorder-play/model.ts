// 15.4 beat 3: two updates for one key, "paid" then "refunded". If the first
// send is lost and retried, the log can hold them in the wrong order. Times
// are in milliseconds: a write lands 5 ms after a send, an ack reaches the
// producer 5 ms after the write, and the producer's timeout is 50 ms.
// Deterministic, no React.

import type { Tone } from "../primitives/tones";

export const WRITE_MS = 5;
export const ACK_MS = 5;
export const TIMEOUT_MS = 50;
export const SECOND_SEND_MS = 10;
export const AXIS_MS = 70;

export type Mode = "free" | "one" | "version";
export const MODES: readonly { id: Mode; label: string }[] = [
  { id: "free", label: "Send freely" },
  { id: "one", label: "One at a time" },
  { id: "version", label: "Version numbers" },
];

export const NAMES = { 1: "paid", 2: "refunded" } as const;
export type Update = 1 | 2;

export type Message = {
  update: Update;
  sentAt: number;
  /** When the log wrote it; null when the send was lost on the way. */
  writtenAt: number | null;
  retry: boolean;
};

export type LogEntry = { update: Update; writtenAt: number; /** False when the consumer skips it because a newer version was applied. */ applied: boolean };

export type Run = {
  mode: Mode;
  lost: boolean;
  messages: Message[];
  /** In the order the log wrote them. */
  log: LogEntry[];
  final: "paid" | "refunded";
  wrong: boolean;
  /** Milliseconds until the last update is written. */
  total: number;
  /** The producer's wait, drawn above its lane. */
  wait: { from: number; to: number; label: string } | null;
};

export function run(lost: boolean, mode: Mode): Run {
  const messages: Message[] = [];
  let wait: Run["wait"] = null;
  if (!lost) {
    messages.push({ update: 1, sentAt: 0, writtenAt: WRITE_MS, retry: false });
    const second = mode === "one" ? WRITE_MS + ACK_MS : SECOND_SEND_MS;
    messages.push({ update: 2, sentAt: second, writtenAt: second + WRITE_MS, retry: false });
    if (mode === "one") wait = { from: 0, to: second, label: "waits for the ack" };
  } else {
    messages.push({ update: 1, sentAt: 0, writtenAt: null, retry: false });
    messages.push({ update: 1, sentAt: TIMEOUT_MS, writtenAt: TIMEOUT_MS + WRITE_MS, retry: true });
    if (mode === "one") {
      const second = TIMEOUT_MS + WRITE_MS + ACK_MS;
      messages.push({ update: 2, sentAt: second, writtenAt: second + WRITE_MS, retry: false });
      wait = { from: 0, to: second, label: "waits for the ack" };
    } else {
      messages.push({ update: 2, sentAt: SECOND_SEND_MS, writtenAt: SECOND_SEND_MS + WRITE_MS, retry: false });
      wait = { from: 0, to: TIMEOUT_MS, label: "timeout 50 ms" };
    }
  }
  messages.sort((a, b) => a.sentAt - b.sentAt);
  const written = messages.flatMap((m) => (m.writtenAt === null ? [] : [{ update: m.update, writtenAt: m.writtenAt }])).sort((a, b) => a.writtenAt - b.writtenAt);
  // With version numbers the consumer keeps the highest version it has applied and skips older ones.
  let top = 0;
  const log: LogEntry[] = written.map((w) => {
    if (mode === "version" && w.update < top) return { ...w, applied: false };
    top = Math.max(top, w.update);
    return { ...w, applied: true };
  });
  const lastApplied = [...log].reverse().find((l) => l.applied) ?? log[log.length - 1];
  const final = NAMES[lastApplied.update];
  return { mode, lost, messages, log, final, wrong: final !== "refunded", total: Math.max(...written.map((w) => w.writtenAt)), wait };
}

export type Verdict = { text: string; tone: Tone };

export function verdictFor(r: Run): Verdict {
  if (!r.lost) return { text: "Order holds, nothing failed", tone: "good" };
  if (r.mode === "free") return { text: "Order shows paid, not refunded", tone: "bad" };
  if (r.mode === "one") return { text: `Safe, but ${r.total} ms instead of ${run(false, "one").total}`, tone: "warn" };
  return { text: "Safe: the old version is skipped", tone: "good" };
}

/** The label of a box in the log: the name, with its version when versions are on. */
export function boxLabel(update: Update, mode: Mode): string {
  return mode === "version" ? `${NAMES[update]} v${update}` : `${update} ${NAMES[update]}`;
}

export function valueText(r: Run): string {
  const order = r.log.map((l) => NAMES[l.update]).join(", then ");
  return `${r.lost ? "first send lost" : "nothing lost"}, ${MODES.find((m) => m.id === r.mode)?.label.toLowerCase()}: log holds ${order}, order shows ${r.final}${r.wrong ? ", which is wrong" : ""}, ${r.total} ms in all`;
}

/** Seconds each message takes to fly, and the gap between the starts of two flights. A story clock, not the axis. */
export const FLIGHT_S = 0.8;
export const STEP_S = 0.9;

/**
 * Where message number k (in the order of sending) is on its way, 0 at the send and 1 at the write;
 * null when it is not in flight. The story plays one message after another, so a 5 ms flight is
 * slow enough to see; the axis in the picture carries the real times.
 */
export function flight(k: number, count: number, seconds: number): number | null {
  const loop = count * STEP_S + 1.6;
  const local = (((seconds % loop) + loop) % loop) - 0.3 - k * STEP_S;
  if (local < 0 || local > FLIGHT_S) return null;
  return local / FLIGHT_S;
}
