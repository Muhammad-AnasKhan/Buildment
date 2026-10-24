// 11.7 beat 1: three copies of one value x (start 0): West 1 and West 2 in one
// region, East in another. The link between the regions can be cut. After each
// press of "Cut the cable" the same script plays: Ada (West) writes x = 1,
// Bao (East) writes x = 2, Cam (East) reads x. West holds 2 of 3 copies, a
// majority; East holds 1 of 3.
//
// Refuse: only the side with a majority answers. East says "try again later".
// When the link is back East copies x = 1 and the copies never disagree.
// Answer: both sides answer. West holds 1 and East holds 2; when the link is
// back the copies compare and find a clash that a rule must settle.

export type Phase = "up" | "cut" | "mended";
export type Mode = "refuse" | "answer";
export type RequestId = "ada" | "bao" | "cam";

export type Step = { id: RequestId; client: string; text: string; at: number; target: "w1" | "e" };

/** Seconds after the press at which each request is sent, and how long a trip takes. */
export const SCRIPT: readonly Step[] = [
  { id: "ada", client: "Ada", text: "writes x = 1", at: 0.6, target: "w1" },
  { id: "bao", client: "Bao", text: "writes x = 2", at: 2.4, target: "e" },
  { id: "cam", client: "Cam", text: "reads x", at: 4.2, target: "e" },
];
export const TRIP_S = 0.9;
/** After the cable is mended, the copies exchange for this long. */
export const MEND_START_S = 0.5;
export const MEND_DONE_S = 1.7;

export type Copies = { w1: number; w2: number; e: number };

/** Does this request get an answer? Under Refuse, East has 1 of 3 copies and is refused. */
export function accepted(mode: Mode, id: RequestId): boolean {
  return mode === "answer" || id === "ada";
}

export type RowState = { id: RequestId | "link"; text: string; state: "waiting" | "ok" | "refused" | "clash" };

/** What the three requests ended with, in words. */
export function finalRows(mode: Mode): RowState[] {
  return SCRIPT.map((s) => {
    const text = `${s.client} ${s.text}`;
    if (!accepted(mode, s.id)) return { id: s.id, text: `${text}: try again later`, state: "refused" as const };
    if (s.id === "ada") return { id: s.id, text: `${text}: accepted by West`, state: "ok" as const };
    if (s.id === "bao") return { id: s.id, text: `${text}: accepted by East`, state: "ok" as const };
    return { id: s.id, text: `${text}: gets 2, West says 1`, state: "ok" as const };
  });
}

/** Copy values after the script has fully played while the cable is cut. */
export function copiesAfterScript(mode: Mode): Copies {
  return mode === "answer" ? { w1: 1, w2: 1, e: 2 } : { w1: 1, w2: 1, e: 0 };
}

/** The values of the three copies `s` seconds after the press. */
export function copiesAt(phase: Phase, mode: Mode, s: number): Copies {
  if (phase === "up") return { w1: 0, w2: 0, e: 0 };
  if (phase === "mended") {
    const after = copiesAfterScript(mode);
    if (s >= MEND_DONE_S && mode === "refuse") return { w1: 1, w2: 1, e: 1 };
    return after;
  }
  const c: Copies = { w1: 0, w2: 0, e: 0 };
  const arrives = (id: RequestId) => (SCRIPT.find((x) => x.id === id) as Step).at + TRIP_S;
  if (s >= arrives("ada")) {
    c.w1 = 1;
    c.w2 = 1;
  }
  if (mode === "answer" && s >= arrives("bao")) c.e = 2;
  return c;
}

/** True once the copies have compared and found two different values. */
export function clashAt(phase: Phase, mode: Mode, s: number): boolean {
  return phase === "mended" && mode === "answer" && s >= MEND_DONE_S;
}

export function rowsAt(phase: Phase, mode: Mode, s: number): RowState[] {
  const final = finalRows(mode);
  const rows = SCRIPT.map((step, i): RowState => {
    if (phase === "up") return { id: step.id, text: `${step.client} ${step.text}: waiting`, state: "waiting" };
    if (phase === "mended" || s >= step.at + TRIP_S) return final[i];
    return { id: step.id, text: `${step.client} ${step.text}: waiting`, state: "waiting" };
  });
  const link: RowState =
    phase !== "mended" || s < MEND_DONE_S
      ? { id: "link", text: "", state: "waiting" }
      : mode === "refuse"
        ? { id: "link", text: "Link back: East copies x = 1", state: "ok" }
        : { id: "link", text: "Link back: x = 1 and x = 2 clash", state: "clash" };
  return [...rows, link];
}

export function verdictFor(phase: Phase, mode: Mode): { text: string; tone: "good" | "warn" | "bad" } {
  if (phase === "up") return { text: "Link up: all three copies agree", tone: "good" };
  if (phase === "cut") return mode === "refuse" ? { text: "East says try again; no clash", tone: "warn" } : { text: "Both answer; copies now differ", tone: "bad" };
  return mode === "refuse" ? { text: "Link back: East catches up", tone: "good" } : { text: "Link back: 1 and 2 must be settled", tone: "bad" };
}

/** What the button does next: up or mended cut the cable; cut mends it. */
export function nextPhase(phase: Phase): Phase {
  return phase === "cut" ? "mended" : "cut";
}

export const buttonLabel = (phase: Phase) => (phase === "cut" ? "Mend the cable" : "Cut the cable");
