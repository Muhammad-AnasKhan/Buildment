import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 1.3 "You make the call".
// Dina's second try at the sports club timetable: the AI drafts two options,
// Dina checks them against facts only she has, chooses the AI's pick because it
// passed her checks, and owns the result. The machine refuses "AI decides" and
// "ship unchecked". See spec.md.
export const whoMakesTheCall: StateMachineSpec = {
  kind: "state-machine",
  title: "Who makes the call?",
  purpose: "Follow one decision from question to owned result, and see which two moves the machine refuses.",
  summary:
    "Dina needs a training timetable for four teams. Letting the AI decide is refused. The AI drafts timetables A and B and recommends A. Posting a draft unchecked is refused. Dina checks both against the hall hours, the coaches and the youngest team's finishing time; B has a coach clash, A passes. She chooses A because it passed her checks, posts it under her own name and answers parents' questions.",
  states: [
    { id: "question", name: "Question", sub: "which timetable?", col: 0, row: 0 },
    { id: "drafted", name: "Options drafted", sub: "two, by the AI", col: 1, row: 0 },
    { id: "owned", name: "Owned", sub: "Dina answers for it", col: 2, row: 0 },
    { id: "checked", name: "Checked", sub: "against the facts", col: 1, row: 1 },
    { id: "decided", name: "Decided", sub: "by Dina", col: 2, row: 1 },
  ],
  edges: [
    { from: "question", to: "drafted", label: "AI drafts" },
    { from: "question", to: "question", label: "AI decides", kind: "rejected" },
    { from: "drafted", to: "owned", label: "ship unchecked", kind: "rejected" },
    { from: "drafted", to: "checked", label: "you" },
    { from: "checked", to: "decided", label: "you choose" },
    { from: "decided", to: "owned", label: "own" },
  ],
  steps: [
    {
      state: "question",
      edge: 0,
      title: "The question",
      note: "Next term, the club's four teams need a training timetable: which team uses the hall when, and with which coach. Dina asks a chat assistant to draft two possible timetables, and gives it the team names and the coaches.",
      chips: ["4 teams", "1 hall", "2 drafts wanted"],
    },
    {
      state: "question",
      edge: 1,
      tone: "bad",
      outcome: "refused",
      title: "Let the AI decide? No.",
      note: "Last term Dina asked for one timetable and posted it straight away. The machine refuses this move: the AI cannot answer the parents, and it did not know the hall closes at 18:00 on Thursdays. The decision stays with a person.",
    },
    {
      state: "drafted",
      title: "Two options drafted",
      note: "In about a minute, the AI drafts timetable A and timetable B, and it recommends A. This is what AI does well: fast drafts and a clear comparison. Neither timetable has been checked yet.",
      chips: ["timetable A, recommended", "timetable B"],
    },
    {
      state: "drafted",
      edge: 2,
      tone: "bad",
      outcome: "refused",
      title: "Post it unchecked? No.",
      note: "Posting A now would repeat last term's mistake. A draft that nobody has checked cannot become the club's timetable, however good it looks.",
    },
    {
      state: "checked",
      edge: 3,
      title: "Dina checks both",
      note: "She checks each timetable against facts only she has: the hall closes at 18:00 on Thursdays, a coach can be in only one place at a time, and the youngest team must finish by 17:00. A passes every check. B puts one coach with two teams on Monday at 16:00.",
      chips: ["hall closes 18:00 Thu", "one coach, one place", "youngest done by 17:00"],
    },
    {
      state: "decided",
      edge: 4,
      tone: "good",
      outcome: "decided",
      title: "Dina chooses A",
      note: "She chooses A, the AI's pick, because it passed her checks, not because the AI picked it. Agreeing with the AI is fine. What matters is that a person with the facts made the choice.",
    },
    {
      state: "owned",
      edge: 5,
      tone: "good",
      outcome: "owned",
      title: "Dina owns the result",
      note: "She posts A in the parents' group under her own name, with a line on how to reach her with questions. If a parent finds a problem, Dina answers and fixes it. The AI drafted; Dina is accountable.",
    },
  ],
  tryThis: [
    "Step 5 shows what Dina's three checks found in each timetable, and step 6 shows what she did with the AI's pick.",
    "At step 5, which of Dina's three checks could the AI have known, and which could only come from her?",
    "Look at the two refused moves. What would each one have cost the club?",
  ],
  limits:
    "Real decisions often have more than two options and more than one person deciding, such as a club committee. Here each check gives a clear yes or no; real checks can be unsure, and then you ask someone or test it. The model leaves out what happens after a problem is found: Dina would fix it and post a corrected timetable.",
};
