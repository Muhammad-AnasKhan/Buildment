import type { Tone } from "../primitives/tones";

// 3.4: one lost packet delays different files depending on the HTTP version.
// Three files (a, b, c), one packet each, a round trip of 80 ms (napkin math).
// A dropped packet's resend arrives one round trip later (illustrative; it
// matches the scenes h2-stall and h3-streams). Pure, no React.
//
//   HTTP/1.1, one connection: files take turns, one round trip each. A drop
//     delays that file and every file queued behind it by one round trip.
//   HTTP/2, one TCP connection: TCP hands bytes over in order, so a drop
//     holds back every stream until the resend arrives.
//   HTTP/3, QUIC: each stream is kept in order on its own, so only the stream
//     that lost the packet waits.

export type VersionId = "h1" | "h2" | "h3";

export const VERSIONS: readonly { id: VersionId; chip: string; name: string }[] = [
  { id: "h1", chip: "HTTP/1.1", name: "HTTP/1.1, one connection" },
  { id: "h2", chip: "HTTP/2", name: "HTTP/2" },
  { id: "h3", chip: "HTTP/3", name: "HTTP/3" },
] as const;

export const FILES = ["a", "b", "c"] as const;
export const RTT_MS = 80;
/** A packet crosses the network in half a round trip. */
export const FLIGHT_MS = RTT_MS / 2;

export type Flight = { fromMs: number; toMs: number; lost: boolean };

export type FileTimeline = {
  file: string;
  /** The first packet, and the resend if it was dropped. */
  flights: Flight[];
  /** When the packet that counts reaches the browser. */
  arriveMs: number;
  /** When the browser can use the file. */
  usableMs: number;
  /** HTTP/2 only: the file arrived but TCP holds it until this time. */
  heldFromMs: number | null;
};

/** The three files' timelines when file `drop` (0, 1 or 2) loses its packet, or none does. */
export function timelines(version: VersionId, drop: number | null): FileTimeline[] {
  return FILES.map((file, k) => {
    const lost = drop === k;
    if (version === "h1") {
      // Requests take turns: each file needs its own round trip, and files behind a drop start one round trip later.
      const slot = k + 1 + (drop !== null && k > drop ? 1 : 0);
      const arriveMs = RTT_MS * slot;
      if (lost) {
        const first = RTT_MS * (k + 1);
        return {
          file,
          flights: [
            { fromMs: first - FLIGHT_MS, toMs: first, lost: true },
            { fromMs: first + FLIGHT_MS, toMs: first + RTT_MS, lost: false },
          ],
          arriveMs: first + RTT_MS,
          usableMs: first + RTT_MS,
          heldFromMs: null,
        };
      }
      return { file, flights: [{ fromMs: arriveMs - FLIGHT_MS, toMs: arriveMs, lost: false }], arriveMs, usableMs: arriveMs, heldFromMs: null };
    }
    // HTTP/2 and HTTP/3 send all three at once: they arrive together after one round trip.
    const flights: Flight[] = lost
      ? [
          { fromMs: FLIGHT_MS, toMs: RTT_MS, lost: true },
          { fromMs: RTT_MS + FLIGHT_MS, toMs: 2 * RTT_MS, lost: false },
        ]
      : [{ fromMs: FLIGHT_MS, toMs: RTT_MS, lost: false }];
    const arriveMs = lost ? 2 * RTT_MS : RTT_MS;
    if (version === "h2") {
      const usableMs = drop === null ? RTT_MS : 2 * RTT_MS;
      return { file, flights, arriveMs, usableMs, heldFromMs: !lost && drop !== null ? RTT_MS : null };
    }
    return { file, flights, arriveMs, usableMs: arriveMs, heldFromMs: null };
  });
}

/** When each file becomes usable, in ms, for example [160, 80, 80]. */
export const usableTimes = (version: VersionId, drop: number | null): number[] => timelines(version, drop).map((t) => t.usableMs);

/** The time the last file becomes usable. */
export const finishMs = (version: VersionId, drop: number | null): number => Math.max(...usableTimes(version, drop));

/** Files delayed by the loss, compared with the same version and no drop. */
export function delayedFiles(version: VersionId, drop: number | null): boolean[] {
  const base = usableTimes(version, null);
  return usableTimes(version, drop).map((ms, k) => ms > base[k]);
}

export type LossVerdict = { text: string; tone: Tone };

/** The one line over the picture. At most 38 characters. */
export function lossVerdict(version: VersionId, drop: number | null): LossVerdict {
  if (drop === null) {
    return version === "h1" ? { text: "No loss: files arrive one by one", tone: "good" } : { text: `No loss: all 3 in ${RTT_MS} ms`, tone: "good" };
  }
  const f = FILES[drop];
  if (version === "h2") return { text: "HTTP/2: 1 loss delays all 3 files", tone: "bad" };
  if (version === "h3") return { text: `HTTP/3: only ${f} waits, ${2 * RTT_MS} ms`, tone: "warn" };
  if (drop === FILES.length - 1) return { text: `HTTP/1.1: only ${f} waits, ${finishMs("h1", drop)} ms`, tone: "warn" };
  return { text: `HTTP/1.1: ${f} and those behind it wait`, tone: "bad" };
}

/** How the delay looks for a file: fine, the file that lost the packet, or a file that did not. */
export type FileTone = "good" | "warn" | "bad";
export function fileTones(version: VersionId, drop: number | null): FileTone[] {
  return delayedFiles(version, drop).map((late, k) => (!late ? "good" : k === drop ? "warn" : "bad"));
}

// ---------- Motion ----------

/** Milliseconds of network time that pass in one second of the picture. */
export const MS_PER_SECOND = FLIGHT_MS;
/** The loop starts partway through the requests' trip, and rests this long at the end. */
export const START_MS = 24;
export const REST_MS = 120;

/** Network time at `seconds` into the loop. */
export function networkMs(seconds: number, version: VersionId, drop: number | null): number {
  const end = finishMs(version, drop) + REST_MS;
  if (!Number.isFinite(seconds)) return end;
  const span = end - START_MS;
  return START_MS + ((((seconds * MS_PER_SECOND) % span) + span) % span);
}

/** Where along the lane a lost packet stops and starts to fall. */
export const FALL_AT = 0.55;

export type FlightPhase =
  | { phase: "before" }
  | { phase: "flying"; pos: number }
  /** A dropped packet falling; `fall` runs 0 to 1. */
  | { phase: "falling"; pos: number; fall: number }
  | { phase: "after"; pos: number };

/** Where one flight is at `ms`: pos runs 0 (at the server) to 1 (inside the browser). */
export function flightAt(f: Flight, ms: number): FlightPhase {
  if (ms < f.fromMs) return { phase: "before" };
  const p = Math.min(1, (ms - f.fromMs) / (f.toMs - f.fromMs));
  if (f.lost) {
    if (p < FALL_AT) return { phase: "flying", pos: p };
    if (p < 1) return { phase: "falling", pos: FALL_AT, fall: (p - FALL_AT) / (1 - FALL_AT) };
    return { phase: "after", pos: FALL_AT };
  }
  return p < 1 ? { phase: "flying", pos: p } : { phase: "after", pos: 1 };
}
