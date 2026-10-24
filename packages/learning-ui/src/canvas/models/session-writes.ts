// 11.5 beat 3: two stories about writes.
//
// Panel 1 (monotonic writes): Amna sends edit 1 (name = Amna) at 0 and edit 2
// (name = Amna K.) at 10. The network delivers edit 2 to the leader at 20 and
// edit 1 at 35. Without write numbers the leader applies in arrival order and
// the older edit wins. With them it holds edit 2 until edit 1 is applied.
//
// Panel 2 (writes follow reads): Omar read question 1 and replied at 10 ms.
// The Replies replica has the reply at 30 ms; the Questions replica gets
// question 1 at 120 ms. Hana reads replies at 50 ms and questions at 60 ms.
// With a dependency the reply carries "after question 1", so Hana's questions
// read needs a copy at position 1 and goes to the leader.

export const EDIT1 = { label: "1: Amna", sentAt: 0, arrivesAt: 35, name: "Amna" } as const;
export const EDIT2 = { label: "2: Amna K.", sentAt: 10, arrivesAt: 20, name: "Amna K." } as const;
export const PANEL1_SPAN_MS = 40;

export type NamePoint = { at: number; name: string };

/** What the leader's name field holds, as a list of changes in time order. */
export function nameChanges(writeNumbers: boolean): NamePoint[] {
  if (writeNumbers) return [{ at: EDIT1.arrivesAt, name: EDIT2.name }];
  return [
    { at: EDIT2.arrivesAt, name: EDIT2.name },
    { at: EDIT1.arrivesAt, name: EDIT1.name },
  ];
}

export function nameAt(writeNumbers: boolean, ms: number): string {
  let name = "none";
  for (const c of nameChanges(writeNumbers)) if (ms >= c.at) name = c.name;
  return name;
}

/** The time window in which the leader holds edit 2 back (write numbers on). */
export const HOLD_WINDOW = { from: EDIT2.arrivesAt, until: EDIT1.arrivesAt } as const;

export function writesVerdict(writeNumbers: boolean): { text: string; tone: "good" | "bad" } {
  return writeNumbers ? { text: "Edits applied in her order", tone: "good" } : { text: "Her last edit was overwritten", tone: "bad" };
}

export const PANEL2_SPAN_MS = 130;
export const REPLY_AT_MS = 30;
export const QUESTION_AT_MS = 120;
export const HANA_REPLIES_AT = 50;
export const HANA_QUESTIONS_AT = 60;

export type Panel2 = {
  /** Where each of Hana's reads went and whether it showed something. */
  replies: { at: number; node: "replies"; shows: boolean };
  questions: { at: number; node: "questions" | "leader"; shows: boolean };
  leaderReads: number;
  inherits: boolean;
  verdict: { text: string; tone: "good" | "bad" };
};

export function panel2(dependencies: boolean): Panel2 {
  const replies = { at: HANA_REPLIES_AT, node: "replies" as const, shows: HANA_REPLIES_AT >= REPLY_AT_MS };
  // With the dependency Hana needs questions >= 1; the Questions replica is at 0 until 120 ms.
  const needs = dependencies && replies.shows ? 1 : 0;
  const replicaHas = HANA_QUESTIONS_AT >= QUESTION_AT_MS ? 1 : 0;
  const toLeader = replicaHas < needs;
  const questions = toLeader ? { at: HANA_QUESTIONS_AT, node: "leader" as const, shows: true } : { at: HANA_QUESTIONS_AT, node: "questions" as const, shows: replicaHas >= 1 };
  return {
    replies,
    questions,
    leaderReads: toLeader ? 1 : 0,
    inherits: needs > 0,
    verdict: toLeader ? { text: "Question read from the leader", tone: "good" } : { text: "Reply shown before its question", tone: "bad" },
  };
}
