import type { StateMachineSpec } from "../renderers/state-machine/types";

// Course 13 v2, chapter 11.3 "Ownership, trust and accountability".
// Jawad (fictional) works at a fictional booking service for small clinics.
// An AI-assisted reminder function showed visit times three hours early to 230
// patients. The machine allows five moves in order: notice, stop the harm, tell
// the people affected, fix, write it down. It refuses two shortcuts: blaming
// the AI, and moving on without telling anyone. See spec.md.
export const ownTheIncident: StateMachineSpec = {
  kind: "state-machine",
  title: "Own the incident",
  purpose: "Follow one mistake from the first phone call to a written note, and see which two moves the machine refuses.",
  summary:
    "Jawad's reminder texts showed visit times three hours early to 230 patients. Blaming the AI is refused. He pauses the next batch of 190 texts. Moving on quietly is refused. He tells Rima and the other clinics what happened. He fixes the time, tests it on the server and sends a correction. He writes a short note, and the incident is owned.",
  states: [
    { id: "notice", name: "Notice", sub: "you see the harm", col: 0, row: 0 },
    { id: "stopped", name: "Harm stopped", sub: "no more sent", col: 1, row: 0 },
    { id: "owned", name: "Owned", sub: "written down", col: 2, row: 0 },
    { id: "told", name: "People told", sub: "in plain words", col: 1, row: 1 },
    { id: "fixed", name: "Fixed", sub: "and tested", col: 2, row: 1 },
  ],
  edges: [
    { from: "notice", to: "stopped", label: "stop it" },
    { from: "notice", to: "notice", label: "blame the AI", kind: "rejected" },
    { from: "stopped", to: "owned", label: "move on", kind: "rejected" },
    { from: "stopped", to: "told", label: "say" },
    { from: "told", to: "fixed", label: "fix it" },
    { from: "fixed", to: "owned", label: "log" },
  ],
  steps: [
    {
      state: "notice",
      title: "Monday, 8:40: a phone call",
      note: "Rima, who manages one of the nine clinics, phones Jawad. Patients are arriving three hours early. Jawad opens one text from Sunday's batch: it says 10:00, and the booking says 13:00.",
      chips: ["230 texts sent", "9 clinics"],
      tone: "warn",
    },
    {
      state: "notice",
      edge: 1,
      tone: "bad",
      outcome: "refused",
      title: "Blame the AI? No.",
      note: "Jawad could say that the assistant wrote the function. The machine refuses this move. Rima cannot call an assistant, and the service sent the texts in its own name. Jawad shipped the code, so Jawad answers.",
    },
    {
      state: "stopped",
      edge: 0,
      tone: "good",
      title: "Stop the harm first",
      note: "The next batch is 190 texts, due at 18:00 and built by the same code. Jawad pauses it before he looks for the cause. Every text sent after this point would repeat the harm.",
      chips: ["190 texts held", "18:00 batch"],
    },
    {
      state: "stopped",
      edge: 2,
      tone: "bad",
      outcome: "refused",
      title: "Move on quietly? No.",
      note: "Jawad could fix the code before 18:00 and say nothing. The machine refuses this move. 230 patients already have the wrong time, and the clinics need to know who they are and what to tell them.",
    },
    {
      state: "told",
      edge: 3,
      title: "Tell the people affected",
      note: "He phones Rima and writes to the other eight clinics. He says which 230 patients got a wrong time, that the fault is in code he shipped, what he is doing, and when he will write again. No excuses, and no blame.",
      chips: ["9 clinics told", "next update at noon"],
    },
    {
      state: "fixed",
      edge: 4,
      tone: "good",
      title: "Fix it and test it",
      note: "The code used the server's clock, which runs three hours behind the clinics. He fixes it, then tests a 13:00 visit on the server itself, not only on his laptop. It shows 13:00. Then the service sends a correction to the 230 patients.",
      chips: ["13:00 shows 13:00", "tested on the server"],
    },
    {
      state: "owned",
      edge: 5,
      tone: "good",
      outcome: "owned",
      title: "Write it down",
      note: "Jawad writes a short note: what happened, who was affected, why, what changed and what is next. He shares it with the clinics and his team. The reason is that nobody tested on the server, not that a tool wrote a function.",
      chips: ["what", "who", "why", "changed", "next"],
    },
    {
      state: "owned",
      title: "The AI's part is in the note",
      note: "The note says an AI assistant helped write the function. It does not use that as the reason. The new rule applies to all code, whoever drafted it: every message gets a test on the server before it goes out.",
      tone: "good",
    },
  ],
  tryThis: [
    "Step 3 shows what Jawad does first, and step 4 shows the quiet fix the machine refuses.",
    "At step 2, why can Rima not accept 'the AI wrote it' as an answer?",
    "Which of the five moves could an AI help with, and which could only a person do?",
  ],
  limits:
    "Real incidents are messier: the cause is unclear at first, several people share the work, and the order can bend, for example telling a manager early while a fix is still being tested. The five moves are the course's own checklist, built on the cases in the chapter, not a rule from a study. Jawad, Rima and the booking service are fictional.",
};
