import type { Trace, TraceItem, TraceStep } from "../sim";

// 5.5 beats 2 and 3: the same ten packets over TCP and over UDP while the
// learner changes the loss rate. A pure model with model numbers, not
// measurements:
//   - the sender sends one packet every 20 ms (packet 1 at 0 ms, packet 10 at 180 ms);
//   - a packet needs 40 ms to cross, so a round trip is 80 ms;
//   - the model drops packets 4, then 8, then 6: 10% drops one packet, 20% two,
//     30% three (ten packets, so each 10% is one packet);
//   - over TCP a lost packet is sent again 90 ms after its first send (one
//     round trip, 80 ms, plus 10 ms to notice) and arrives 40 ms later. TCP
//     hands data to the app in order, so every packet behind a lost one waits
//     until the lost one has arrived (the receiver holds it back);
//   - over UDP a lost packet is simply missing. Nothing waits and nothing is sent again.
// No timer value, loss rate or delay of a real network is claimed here.

export type Mode = "tcp" | "udp";

export const PACKETS = 10;
export const GAP_MS = 20;
export const ONE_WAY_MS = 40;
export const ROUND_TRIP_MS = 2 * ONE_WAY_MS;
export const RESEND_AFTER_MS = ROUND_TRIP_MS + 10;
export const RATES = [0, 10, 20, 30] as const;
export type Rate = (typeof RATES)[number];
/** The packets the model drops, in the order the loss rate rises. */
export const LOSS_ORDER = [4, 8, 6] as const;
/** The time range of the picture, the same for every rate so the axis never jumps. */
export const RANGE_MS: [number, number] = [0, 300];

export const clampRate = (value: number): Rate => {
  const n = Number.isFinite(value) ? value : 0;
  return RATES.reduce((best, r) => (Math.abs(r - n) < Math.abs(best - n) ? r : best), RATES[0]);
};

/** The packets (1 to 10) the model drops at this rate, in packet order. */
export function lostAt(rate: number): number[] {
  const count = Math.round((clampRate(rate) / 100) * PACKETS);
  return LOSS_ORDER.slice(0, count).slice().sort((a, b) => a - b);
}

export const sentAt = (packet: number): number => (packet - 1) * GAP_MS;

export type PacketRun = {
  packet: number;
  lost: boolean;
  sentMs: number;
  /** When it reaches the receiver's computer (the resend for a lost TCP packet), or null for a lost UDP packet. */
  arriveMs: number | null;
  /** When the app gets it, or null if it never does. */
  handedMs: number | null;
};

/** What happens to each packet over one protocol. */
export function runPackets(mode: Mode, rate: number): PacketRun[] {
  const lost = new Set(lostAt(rate));
  const out: PacketRun[] = [];
  let previousHanded = 0;
  for (let packet = 1; packet <= PACKETS; packet += 1) {
    const sent = sentAt(packet);
    const isLost = lost.has(packet);
    if (mode === "udp") {
      const arrive = isLost ? null : sent + ONE_WAY_MS;
      out.push({ packet, lost: isLost, sentMs: sent, arriveMs: arrive, handedMs: arrive });
      continue;
    }
    const arrive = isLost ? sent + RESEND_AFTER_MS + ONE_WAY_MS : sent + ONE_WAY_MS;
    const handed = Math.max(arrive, previousHanded);
    previousHanded = handed;
    out.push({ packet, lost: isLost, sentMs: sent, arriveMs: arrive, handedMs: handed });
  }
  return out;
}

/** How long a packet took from the sender to the app, or null if it never got there. */
export const delayOf = (run: PacketRun): number | null => (run.handedMs === null ? null : run.handedMs - run.sentMs);

/** Packets that got to the app later than the normal 40 ms. */
export const latePackets = (runs: PacketRun[]): number[] => runs.filter((r) => (delayOf(r) ?? 0) > ONE_WAY_MS).map((r) => r.packet);

/** Packets the app never gets. */
export const missingPackets = (runs: PacketRun[]): number[] => runs.filter((r) => r.handedMs === null).map((r) => r.packet);

/** The stretches in which a packet has reached the receiver but is held back, merged where they overlap. */
export function heldSpans(runs: PacketRun[]): [number, number][] {
  const raw = runs
    .filter((r) => r.arriveMs !== null && r.handedMs !== null && r.handedMs > r.arriveMs)
    .map((r): [number, number] => [r.arriveMs as number, r.handedMs as number])
    .sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const span of raw) {
    const last = merged[merged.length - 1];
    if (last && span[0] <= last[1]) last[1] = Math.max(last[1], span[1]);
    else merged.push([span[0], span[1]]);
  }
  return merged;
}

const list = (packets: number[]): string => {
  if (packets.length === 0) return "none";
  if (packets.length === 1) return `packet ${packets[0]}`;
  return `packets ${packets.slice(0, -1).join(", ")} and ${packets[packets.length - 1]}`;
};

export const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The one-line result: what the app got, and how late. */
export function resultLine(mode: Mode, rate: number): { outcome: string; tone: "good" | "warn" | "bad" } {
  const runs = runPackets(mode, rate);
  const late = latePackets(runs).length;
  const missing = missingPackets(runs).length;
  if (mode === "tcp") {
    return late === 0 ? { outcome: "0 late", tone: "good" } : { outcome: `${late} of ${PACKETS} late`, tone: "bad" };
  }
  return missing === 0 ? { outcome: "0 missing", tone: "good" } : { outcome: `${missing} of ${PACKETS} missing`, tone: "warn" };
}

/** Build the trace the timeline renderer draws. Steps reveal the run one idea at a time. */
export function buildLossTrace(mode: Mode, rate: number): Trace {
  const runs = runPackets(mode, rate);
  const lost = runs.filter((r) => r.lost).map((r) => r.packet);
  const items: TraceItem[] = [];
  const steps: TraceStep[] = [];

  // Step 0: the packets that get through on the first try leave and arrive.
  steps.push({
    title: "A packet leaves every 20 ms",
    note: `The sender sends ${PACKETS} packets, one every ${GAP_MS} ms. A packet needs ${ONE_WAY_MS} ms to cross, so when nothing is lost each one arrives ${ONE_WAY_MS} ms after it left.`,
    tone: "accent",
  });
  for (const r of runs) {
    if (r.lost) continue;
    items.push({ kind: "message", from: "sender", to: "receiver", sentAt: r.sentMs, receivedAt: r.sentMs + ONE_WAY_MS, label: String(r.packet), tone: "good", step: 0 });
  }

  if (lost.length === 0) {
    steps.push({
      title: "Nothing is lost, so nothing waits",
      note: `All ${PACKETS} packets arrive ${ONE_WAY_MS} ms after they left. The app gets each one at once, in order. TCP and UDP look the same when no packet is lost.`,
      tone: "good",
      outcome: mode === "tcp" ? "0 late" : "0 missing",
    });
    return { lanes: lanes(), items, steps, range: RANGE_MS, unit: "ms" };
  }

  // Step 1: the link drops packets.
  const s1 = steps.length;
  steps.push({
    title: lost.length === 1 ? "The link drops one packet" : `The link drops ${lost.length} packets`,
    note: `The link loses ${list(lost)}. A lost packet never arrives, and the receiver is not told. Each red arrow that stops at the Network line is a lost packet.`,
    tone: "bad",
    outcome: `${lost.length} lost`,
  });
  for (const r of runs) {
    if (!r.lost) continue;
    items.push({ kind: "message", from: "sender", to: "link", sentAt: r.sentMs, receivedAt: r.sentMs + ONE_WAY_MS / 2, label: "", tone: "bad", step: s1 });
    items.push({ kind: "point", lane: "link", at: r.sentMs + ONE_WAY_MS / 2, label: `${r.packet} lost`, shape: "diamond", tone: "bad", labelRow: 1, step: s1 });
  }

  if (mode === "udp") {
    const missing = missingPackets(runs);
    steps.push({
      title: "UDP moves on",
      note: `UDP sends nothing again. The app gets the other ${PACKETS - missing.length} packets ${ONE_WAY_MS} ms after they left, in order, and ${list(missing)} ${missing.length === 1 ? "is" : "are"} simply missing. Nothing waits.`,
      tone: "warn",
      outcome: `${missing.length} of ${PACKETS} missing`,
    });
    return { lanes: lanes(), items, steps, range: RANGE_MS, unit: "ms" };
  }

  // TCP, step 2: the packets behind a loss are held back.
  const s2 = steps.length;
  const held = heldSpans(runs);
  steps.push({
    title: "The packets behind a loss wait",
    note: "TCP hands data to the app in order. Packets that arrive after a lost one are kept back until the lost one has arrived. The orange bars show the waiting.",
    tone: "warn",
  });
  for (const [from, to] of held) items.push({ kind: "span", lane: "receiver", from, to, label: "held back", tone: "warn", step: s2 });

  // TCP, step 3: the lost packets are sent again.
  const late = latePackets(runs);
  steps.push({
    title: "Each lost packet is sent again",
    note: `The sender sends ${list(lost)} again, one round trip (${ROUND_TRIP_MS} ms) after the first try, and the resend takes ${ONE_WAY_MS} ms to cross. The app gets everything, but ${plural(late.length, "packet")} of ${PACKETS} came late.`,
    tone: "bad",
    outcome: `${late.length} of ${PACKETS} late`,
  });
  const s3 = steps.length - 1;
  for (const r of runs) {
    if (!r.lost) continue;
    items.push({ kind: "message", from: "sender", to: "receiver", sentAt: r.sentMs + RESEND_AFTER_MS, receivedAt: r.sentMs + RESEND_AFTER_MS + ONE_WAY_MS, label: "", tone: "accent", step: s3 });
  }
  return { lanes: lanes(), items, steps, range: RANGE_MS, unit: "ms" };
}

function lanes(): Trace["lanes"] {
  return [
    { id: "sender", label: "Sender" },
    { id: "link", label: "Network" },
    { id: "receiver", label: "Receiver", sublabel: "app" },
  ];
}
