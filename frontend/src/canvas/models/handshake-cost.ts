import type { Tone } from "../primitives/tones";

// 3.2: the time before the first byte on a connection is the number of round
// trips times one round trip. The protocol sets the count; the distance sets
// the round trip. Pure, no React.
//
//   plain TCP (HTTP)          2 round trips: TCP handshake, then the request
//   TCP with TLS 1.3          3 round trips: TCP, TLS, then the request
//   QUIC, first visit         2 round trips: one combined handshake, then the request
//   QUIC 0-RTT, return visit  1 round trip: the request rides in the first flight
//   reused connection         1 round trip: the request alone
//
// TLS 1.2 is left out on purpose until its source note is resolved.

export type ProtocolId = "tcp" | "tls13" | "quic" | "zero-rtt" | "reused";

export type Protocol = {
  id: ProtocolId;
  /** Short words for the chip. */
  chip: string;
  /** Plain name for screen readers. */
  name: string;
  /** What each round trip pays for, in order. The last one is always the request. */
  trips: readonly string[];
};

export const PROTOCOLS: readonly Protocol[] = [
  { id: "tcp", chip: "TCP", name: "Plain TCP", trips: ["TCP", "request"] },
  { id: "tls13", chip: "TCP+TLS", name: "TCP with TLS 1.3", trips: ["TCP", "TLS", "request"] },
  { id: "quic", chip: "QUIC", name: "QUIC, first visit", trips: ["QUIC", "request"] },
  { id: "zero-rtt", chip: "QUIC 0-RTT", name: "QUIC 0-RTT, return visit", trips: ["request"] },
  { id: "reused", chip: "Reused", name: "A reused connection", trips: ["request"] },
] as const;

export type DistanceId = "same" | "na" | "atlantic" | "asia";

export type Distance = {
  id: DistanceId;
  /** Words on the rail. */
  label: string;
  /** Longer words for screen readers. */
  name: string;
  /** One round trip, in ms (napkin-math figures). */
  rttMs: number;
};

export const DISTANCES: readonly Distance[] = [
  { id: "same", label: "Same region", name: "Same region", rttMs: 0.25 },
  { id: "na", label: "N. America", name: "North America, east to west", rttMs: 60 },
  { id: "atlantic", label: "Atlantic", name: "Western Europe to North America East", rttMs: 80 },
  { id: "asia", label: "Singapore", name: "Western Europe to Singapore", rttMs: 160 },
] as const;

export const DEFAULT_PROTOCOL: ProtocolId = "tls13";
export const DEFAULT_DISTANCE: DistanceId = "asia";

/** The bar is drawn on one fixed scale: three round trips at the longest distance. */
export const BAR_MAX_MS = 480;

export const protocolOf = (id: ProtocolId): Protocol => PROTOCOLS.find((p) => p.id === id) ?? PROTOCOLS[1];
export const distanceOf = (id: DistanceId): Distance => DISTANCES.find((d) => d.id === id) ?? DISTANCES[3];

export const distanceIndex = (id: DistanceId): number => DISTANCES.findIndex((d) => d.id === id);

/** Round trips before the first byte arrives. */
export const tripCount = (id: ProtocolId): number => protocolOf(id).trips.length;

/** Milliseconds before the first byte: round trips times one round trip. */
export function firstByteMs(protocol: ProtocolId, distance: DistanceId): number {
  return tripCount(protocol) * distanceOf(distance).rttMs;
}

/** 0.25 → "0.25 ms", 0.75 → "0.75 ms", 160 → "160 ms", 1200 → "1,200 ms". */
export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "no limit";
  if (ms < 10) return `${String(Number(ms.toFixed(2)))} ms`;
  return `${Math.round(ms).toLocaleString("en-US")} ms`;
}

export type Segment = { label: string; ms: number; start: number };

/** One segment per round trip, laid end to end. */
export function segmentsOf(protocol: ProtocolId, distance: DistanceId): Segment[] {
  const rtt = distanceOf(distance).rttMs;
  return protocolOf(protocol).trips.map((label, i) => ({ label, ms: rtt, start: i * rtt }));
}

export type HandshakeVerdict = { text: string; tone: Tone };

/** The one line over the picture. At most 38 characters. */
export function handshakeVerdict(protocol: ProtocolId, distance: DistanceId): HandshakeVerdict {
  const d = distanceOf(distance);
  const ms = firstByteMs(protocol, distance);
  if (distance === "same") return { text: "Same region: under 1 ms, any way", tone: "good" };
  switch (protocol) {
    case "tcp":
      return { text: `TCP: 2 round trips, ${formatMs(ms)}`, tone: "warn" };
    case "tls13":
      return { text: `TCP+TLS: 3 round trips, ${formatMs(ms)}`, tone: ms >= 300 ? "bad" : "warn" };
    case "quic":
      return { text: `QUIC saves one round trip: ${formatMs(d.rttMs)}`, tone: "good" };
    case "zero-rtt":
      return { text: "0-RTT: safe-to-repeat requests only", tone: "warn" };
    case "reused":
      return { text: `Reused: 1 round trip, ${formatMs(ms)}`, tone: "good" };
  }
}

// ---------- Motion: one dot goes out and comes back for each round trip ----------

/** Seconds one round trip takes in the picture, and the pause before the loop restarts. */
export const TRIP_SECONDS = 1.1;
export const HOLD_SECONDS = 1.6;

export type TripPhase = {
  /** The round trip in progress, 0 based, or null while the picture rests. */
  trip: number | null;
  /** 0 to 0.5 on the way out, 0.5 to 1 on the way back. */
  progress: number;
};

export function tripPhase(seconds: number, trips: number): TripPhase {
  if (!Number.isFinite(seconds) || trips <= 0) return { trip: null, progress: 0 };
  const loop = trips * TRIP_SECONDS + HOLD_SECONDS;
  const t = ((seconds % loop) + loop) % loop;
  if (t >= trips * TRIP_SECONDS) return { trip: null, progress: 0 };
  const trip = Math.min(trips - 1, Math.floor(t / TRIP_SECONDS + 1e-9));
  return { trip, progress: Math.max(0, Math.min(1, (t - trip * TRIP_SECONDS) / TRIP_SECONDS)) };
}
