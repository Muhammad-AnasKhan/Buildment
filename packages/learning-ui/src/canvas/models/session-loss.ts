// Chapter 4.3: four app servers and 1,200 logged-in students. Where the
// session lives decides who is logged out when a server (or the store) dies.
// Pure functions, no React.

import type { Tone } from "../primitives/tones";

export const SERVERS = 4;
export const STUDENTS_PER_SERVER = 300;
export const STUDENTS = SERVERS * STUDENTS_PER_SERVER;
/** One dot in the picture stands for this many students. */
export const STUDENTS_PER_DOT = 10;

export type SessionMode = "memory" | "sticky" | "store";
export const MODES: readonly { id: SessionMode; label: string }[] = [
  { id: "memory", label: "In memory" },
  { id: "sticky", label: "Sticky" },
  { id: "store", label: "Shared store" },
];

export type SessionState = {
  mode: SessionMode;
  /** Which app servers are down, by index 0 to 3. */
  down: readonly boolean[];
  storeDown: boolean;
};

export type SessionResult = {
  liveServers: number;
  downServers: number;
  /** Students logged out right now. */
  loggedOut: number;
  /** Students who still hold a session. */
  loggedIn: number;
  /** Requests out of every group of live servers that miss the session (memory mode), as [missed, of]. */
  miss: [number, number] | null;
  verdict: string;
  tone: Tone;
};

export const formatCount = (n: number) => Math.round(n).toLocaleString("en-US");

export function sessionLoss(state: SessionState): SessionResult {
  const down = state.down.slice(0, SERVERS);
  const downServers = down.filter(Boolean).length;
  const liveServers = SERVERS - downServers;
  const storeMode = state.mode === "store";
  const storeDown = storeMode && state.storeDown;
  const loggedOut = storeMode ? (storeDown ? STUDENTS : 0) : downServers * STUDENTS_PER_SERVER;
  const loggedIn = STUDENTS - loggedOut;
  let miss: [number, number] | null = null;
  let verdict: string;
  let tone: Tone;

  if (state.mode === "memory") {
    if (liveServers >= 2) {
      miss = [liveServers - 1, liveServers];
      verdict = `Every ${liveServers - 1} in ${liveServers} requests miss a session`;
      tone = "bad";
    } else if (liveServers === 1) {
      verdict = `One server left: ${formatCount(loggedOut)} logged out`;
      tone = "bad";
    } else {
      verdict = `All down: all ${formatCount(STUDENTS)} logged out`;
      tone = "bad";
    }
  } else if (state.mode === "sticky") {
    if (downServers === 0) {
      verdict = "Each server down: its users log out";
      tone = "warn";
    } else if (liveServers === 0) {
      verdict = `All down: all ${formatCount(STUDENTS)} logged out`;
      tone = "bad";
    } else {
      verdict = `Sticky: ${formatCount(loggedOut)} students logged out`;
      tone = "bad";
    }
  } else if (storeDown) {
    verdict = `Store down: all ${formatCount(STUDENTS)} logged out`;
    tone = "bad";
  } else if (liveServers === 0) {
    verdict = "No server left, but sessions are safe";
    tone = "warn";
  } else {
    verdict = "Shared store: nobody logged out";
    tone = "good";
  }
  return { liveServers, downServers, loggedOut, loggedIn, miss, verdict, tone };
}

/** Dots a server's crowd shows: one per ten students. */
export const CROWD_DOTS = STUDENTS_PER_SERVER / STUDENTS_PER_DOT;
