import type { StateMachineSpec } from "../renderers/state-machine/types";

// The Founder Interview course, chapter 1.2 "One time, not 'usually'".
// Samer's answer moves from a self-description, to a pseudo-story, to a story.
// Each weaker kind of answer draws a probe and costs a turn. See spec.md.
export const storyOrUsually: StateMachineSpec = {
  kind: "state-machine",
  title: "From 'usually' to one time",
  purpose: "Follow Samer's answer from a self-description to a story, and see what each kind of answer costs.",
  summary:
    "The founder asks for a time Samer fixed a problem fast. Samer first describes himself, which the founder cannot check. Then he describes what his team usually does, a pseudo-story, which draws the question 'Which time?'. Finally he tells one time: the address check he built. The story carries a time, his part and a result, so the founder can check it.",
  states: [
    { id: "ask", name: "The question", sub: "a time you fixed it", col: 0, row: 0 },
    { id: "self", name: "Self-description", sub: "I am quick and calm", col: 1, row: 0 },
    { id: "pseudo", name: "Pseudo-story", sub: "we usually fix it", col: 2, row: 0 },
    { id: "which", name: "Which time?", sub: "the founder asks", col: 2, row: 1 },
    { id: "story", name: "A story", sub: "one day, one problem", col: 1, row: 1 },
    { id: "proof", name: "Can be checked", sub: "time, my part, result", col: 0, row: 1 },
  ],
  edges: [
    { from: "ask", to: "self", label: "first answer" },
    { from: "self", to: "pseudo", label: "an example?" },
    { from: "pseudo", to: "which", label: "ask" },
    { from: "which", to: "story", label: "one time" },
    { from: "story", to: "proof", label: "has proof" },
  ],
  steps: [
    {
      state: "ask",
      edge: 0,
      title: "The question",
      note: "The founder says, 'Tell me about a time you fixed a problem fast.' This is turn 1. Samer has to choose what kind of answer to give. Before you press Next: what kind of answer will he give first?",
      chips: ["turn 1"],
    },
    {
      state: "self",
      edge: 1,
      tone: "warn",
      outcome: "self-description",
      title: "A description of Samer",
      note: "Samer says, 'I am quick and calm under pressure.' It describes him. It has no day and no event, so the founder cannot check it. He asks, 'Can you give me an example?' That is one more question. Before you press Next: will Samer's next answer be a day, or something else?",
      chips: ["no day", "no event", "turn 2"],
    },
    {
      state: "pseudo",
      edge: 2,
      tone: "warn",
      outcome: "pseudo-story",
      title: "A habit, not a day",
      note: "Samer says, 'We usually fix issues fast. When dispatch reports a bug, we look at it the same day.' This is closer, because it mentions work. But 'usually' and 'when' describe a habit. There is still no one day to check. Before you press Next: what does the founder ask now?",
      chips: ["usually", "whenever", "turn 3"],
    },
    {
      state: "which",
      edge: 3,
      title: "The question a story answers first",
      note: "'Which time?' asks for one day. Samer must now choose a real event from 14 months of work. The answer is the small address check he built, the one he nearly left out. Before you press Next: what should Samer say about it, in four sentences?",
      chips: ["turn 4"],
    },
    {
      state: "story",
      edge: 4,
      tone: "good",
      outcome: "a story",
      title: "One time",
      note: "Samer says, 'In my fourth month, drivers kept phoning dispatch about wrong addresses. The dispatch call sheet showed about 12 calls a week. I built a check on the order screen that flags a bad address. Once the check worked, the sheet showed about 5 calls a week for four weeks.' One day, one problem, one thing he did. Before you press Next: what can the founder check in this answer?",
      chips: ["a time", "a problem", "what I did", "a result"],
    },
    {
      state: "proof",
      tone: "good",
      outcome: "checkable",
      title: "The story carries its evidence",
      note: "Count what the founder got without asking: a time, a problem, Samer's own part, a number and where it came from (the call sheet). The next 'why?' has something to hold on to. The first two answers gave the founder nothing to hold.",
      chips: ["source: call sheet", "ready for a why"],
    },
  ],
  tryThis: [
    "Count the follow-up questions the founder asks before Samer reaches a story. Then check your prediction from the chapter.",
    "At step 5, find the four things in Samer's story that the founder can check: a time, a problem, Samer's own action and a number with its source.",
  ],
  limits:
    "This is one example of how a founder might follow up. Real interviewers differ, and some will accept a short habit answer and move on. The numbers are the case's own, and a real story needs your own facts and a source you can name.",
};
