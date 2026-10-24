import type { StateMachineSpec } from "../renderers/state-machine/types";

// The Founder Interview course, chapter 7.2 "Reading feedback and filling the gaps".
// Tala tags her own answers with the five flag names before she opens the
// feedback card, compares her tags with the card, keeps what her words support,
// questions the praise they do not support, compares her first and last
// interviews, finds the gap in her story bank and plans how to fill it.
// Each step ends with a question that the next step answers. See spec.md.
export const feedbackToNextProject: StateMachineSpec = {
  kind: "state-machine",
  title: "Tala reads her feedback card",
  purpose:
    "Tag your own answers first, compare your tags with the card, keep what your words support, question what they do not, and turn the gap you find into a plan.",
  summary:
    "Tala tags her last transcript with the five flag names and finds one, unsupported number. The card's Things to watch list names the same flag, and its weakness matches her tag. Its praise, strong impact for a long answer, does not match her words: the answer has no number at all. She compares her tags from her first interview, three, with her last, one. Then she finds the gap in her story bank, a number she can source, and plans to ask her lead if she may count failed bookings before and after her change.",
  states: [
    { id: "tag", name: "Tag first", sub: "your own answers", col: 0, row: 0 },
    { id: "card", name: "Read the card", sub: "then compare", col: 1, row: 0 },
    { id: "verdict", name: "Keep or question", sub: "each line", col: 2, row: 0 },
    { id: "compare", name: "Compare drills", sub: "your tags, twice", col: 2, row: 1 },
    { id: "gap", name: "Find the gap", sub: "in your story bank", col: 1, row: 1 },
    { id: "plan", name: "Plan to fill it", sub: "a step and a date", col: 0, row: 1 },
  ],
  edges: [
    { from: "tag", to: "card", label: "then read" },
    { from: "card", to: "verdict", label: "decide" },
    { from: "verdict", to: "compare", label: "so" },
    { from: "compare", to: "gap", label: "what is left" },
    { from: "gap", to: "plan", label: "fill it" },
  ],
  steps: [
    {
      state: "tag",
      title: "Tag your own answers first",
      note: "Tala reads her last transcript before she opens the card. Beside each problem she writes a flag name and her own words. She finds one: unsupported number. She said crashes fell by about a third, and when asked where from, she said: I think it was on a dashboard. Before you press Next: where do you expect the card to agree with her tag?",
      chips: ["1 tag", "her words, quoted"],
    },
    {
      state: "card",
      edge: 0,
      title: "Read the card, then compare",
      note: "The card has three strengths, one weakness with a fix, notes for each area, Things to watch and three next steps. Things to watch names unsupported number with her words, and the weakness says the crash number has no source, so both match her tag. One strength says: strong impact, her long answer about the offline mode shows clear results. Her tags say nothing about that answer. Before you press Next: do her words support the praise?",
      chips: ["tag and card agree: 1", "card line with no tag: 1"],
    },
    {
      state: "verdict",
      edge: 1,
      tone: "good",
      outcome: "keep it, act on it",
      title: "Where tag and card agree",
      note: "Her words and the card say the same thing about the number: no before, no after and no source. She keeps it and puts it on her list to fix. Before you press Next: what does she do with the praise?",
      chips: ["kept: unsupported number"],
    },
    {
      state: "verdict",
      tone: "warn",
      outcome: "question the praise",
      title: "Where only the card speaks",
      note: "She searches the long answer, about 190 words, for a number, a before and after, or the words I did not measure that. It has none of them. Long and detailed is not the same as impact. She marks the line for her mentor. Before you press Next: her first interview had more tags. What will comparing them show?",
      chips: ["about 190 words", "0 numbers"],
    },
    {
      state: "compare",
      edge: 2,
      tone: "good",
      outcome: "3 tags to 1",
      title: "Compare your tags across interviews",
      note: "In her first interview she tagged vague ownership, pseudo-story and unsupported number. In her last she tagged one. Her tags use the same names each time, so she can compare them, and her words explain the change: I for her own part, one real time. Before you press Next: what is still missing from her story bank?",
      chips: ["first interview: 3", "last interview: 1"],
    },
    {
      state: "gap",
      edge: 3,
      title: "Find the gap",
      note: "She lists her five stories. None has an impact number she can source. Her best story, the offline mode, has only the crash claim that she could not source. Before you press Next: how could she get a number honestly?",
      chips: ["gap: a number with a source"],
    },
    {
      state: "plan",
      edge: 4,
      tone: "good",
      outcome: "a plan with a date",
      title: "Plan to fill it",
      note: "She will ask her lead if she may count failed bookings in the logs, four weeks before and four weeks after the change. If her lead says no, she will say: I did not measure that, and I would count failed bookings first. She writes the date: Friday.",
      chips: ["step: ask her lead", "by Friday"],
    },
  ],
  tryThis: [
    "At step 7, check the prediction you made above the canvas. What should Tala say if her lead says no?",
    "At each question, answer in your own words before you press Next. At step 4, count the numbers in the long answer first.",
  ],
  limits:
    "This is one card and one story. A real card has more lines, and a transcript can be unclear: then keep the line for now and ask your mentor. You can also be too kind to your own answers when you tag them, so a second reader helps. The card is practice feedback, and it can be wrong in both directions.",
};
