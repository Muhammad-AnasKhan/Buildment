import type { StateMachineSpec } from "../renderers/state-machine/types";

// The Founder Interview course, chapter 7.2 "Reading feedback and filling the gaps".
// Tala reads the feedback card from her last practice interview line by line:
// she finds her own words for each line, keeps the flag the transcript supports,
// questions the praise it does not support, compares the card with her first one,
// finds the gap in her story bank and plans how to fill it. See spec.md.
export const feedbackToNextProject: StateMachineSpec = {
  kind: "state-machine",
  title: "Tala reads her feedback card",
  purpose:
    "Check each line of a practice interview card against your own words, keep what the transcript supports, question what it does not, and turn the gap you find into a plan.",
  summary:
    "Tala's last card has one flag, unsupported number, and praises a long answer as strong impact. She finds her own words for each line. The flag is supported: the only number she gave had no source. The praise is not: the long answer has no number at all. She compares the card with her first card, which had three flags. Then she finds the gap in her story bank, a number she can source, and plans to count failed bookings before and after her change.",
  states: [
    { id: "card", name: "The card", sub: "flags and praise", col: 0, row: 0 },
    { id: "words", name: "Find your words", sub: "in the transcript", col: 1, row: 0 },
    { id: "verdict", name: "Keep or question", sub: "each line", col: 2, row: 0 },
    { id: "compare", name: "Compare drills", sub: "same flag names", col: 2, row: 1 },
    { id: "gap", name: "Find the gap", sub: "in your story bank", col: 1, row: 1 },
    { id: "plan", name: "Plan to fill it", sub: "a step and a date", col: 0, row: 1 },
  ],
  edges: [
    { from: "card", to: "words", label: "check" },
    { from: "words", to: "verdict", label: "decide" },
    { from: "verdict", to: "compare", label: "so" },
    { from: "compare", to: "gap", label: "what is left" },
    { from: "gap", to: "plan", label: "fill it" },
  ],
  steps: [
    {
      state: "card",
      title: "Start with the card",
      note: "Tala's last practice interview ended with one flag, unsupported number, and three strengths. One strength says: strong impact, her long answer about the offline mode was detailed. Do not believe or reject a line yet.",
      chips: ["1 flag", "3 strengths"],
    },
    {
      state: "words",
      edge: 0,
      title: "Find your own words",
      note: "For the flag, she searches her transcript. She said the app had about a third fewer crashes. Asked where that came from, she said: I think it was on a dashboard. She gave no source.",
      chips: ["evidence: her own transcript"],
    },
    {
      state: "verdict",
      edge: 1,
      tone: "good",
      outcome: "keep the flag",
      title: "The flag is supported",
      note: "Her words match the flag: a number with no before, no after and no source. She keeps it, and it goes on her list to fix.",
      chips: ["kept: unsupported number"],
    },
    {
      state: "verdict",
      tone: "warn",
      outcome: "question the praise",
      title: "The praise is not supported",
      note: "She searches the long offline-mode answer for a number, a before and after, or the words I did not measure that. It has none of them. It is long and detailed, but it does not show impact. She will ask her mentor about it.",
      chips: ["about 190 words", "0 numbers"],
    },
    {
      state: "compare",
      edge: 2,
      tone: "good",
      outcome: "3 flags to 1",
      title: "Compare with the first card",
      note: "Her first card had three flags: vague ownership, pseudo-story and unsupported number. The last has one. The same flag names make this possible. Her transcript shows I for her own part, so two flags are gone for a reason she can point to.",
      chips: ["first card: 3", "last card: 1"],
    },
    {
      state: "gap",
      edge: 3,
      title: "Find the gap",
      note: "She lists her five stories. None has an impact number she can source. The offline-mode story, her best one, has only the crash claim she could not source.",
      chips: ["gap: a number with a source"],
    },
    {
      state: "plan",
      edge: 4,
      tone: "good",
      outcome: "a plan with a date",
      title: "Plan to fill it",
      note: "She will ask her lead if she may count failed bookings in the logs, four weeks before and four weeks after the change. If the lead says no, she will say: I did not measure that, and here is how I would. She writes the date.",
      chips: ["step: ask her lead", "by Friday"],
    },
  ],
  tryThis: [
    "At step 3, check the prediction you made above the canvas. Did the transcript support the flag?",
    "At step 4, count the numbers in the long answer. Why is a long answer not the same as a result?",
  ],
  limits:
    "This is one card and one story. A real card has more lines, and you may find that the transcript is unclear: then keep the line for now and ask your mentor. The card is practice feedback, and it can be wrong in both directions: it can miss a real problem as well as praise a weak answer.",
};
