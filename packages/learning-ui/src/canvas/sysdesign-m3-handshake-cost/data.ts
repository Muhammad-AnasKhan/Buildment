import type { CustomCanvasSpec } from "../registry";
import { HandshakeCostCanvas } from "./HandshakeCostCanvas";

// 3.2, beat 4: the time before the first byte is the number of round trips
// times one round trip. The protocol sets the count (plain TCP 2, TCP with
// TLS 1.3 3, QUIC first visit 2, QUIC 0-RTT and a reused connection 1); the
// distance sets the round trip (0.25, 60, 80 and 160 ms). Model:
// models/handshake-cost.ts.
export const sysdesignM3HandshakeCost: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick a protocol, drag the server away",
  purpose: "Choose how a connection starts, then drag the server from the same region to Singapore and watch the round trips stack up into the wait before the first byte.",
  limits:
    "Round trip times are round napkin-math figures for one data centre pair each, not measurements, and the bar counts only round trips: it leaves out the server's own work, the size of the page, packet loss and the time to look up the name. TLS 1.2 is not shown. The 0-RTT case is for a returning visitor whose client kept a session from an earlier visit, and it only suits requests that are safe to repeat, because an attacker can replay the first flight.",
  component: HandshakeCostCanvas,
};
