import type { StateMachineSpec } from "../renderers/state-machine/types";

// Think Clearly course, chapter 2.5 "Flowcharts: draw a decision".
// Lina's flowchart for a freelance offer: two yes or no questions and one
// detour to ask the client for more time. The numbers match the chapter's
// worked example. See spec.md.
export const freelanceJobFlowchart: StateMachineSpec = {
  kind: "state-machine",
  title: "Lina's flowchart for a freelance offer",
  purpose: "Follow one offer through a flowchart and see how each yes or no answer picks the next box.",
  summary:
    "The flowchart starts at the question 'Deadline fits?'. Yes goes to 'Pay fair?'; no goes to 'Ask for time', which goes on to 'Pay fair?' if the client agrees, or to 'Decline politely' if not. At 'Pay fair?', yes leads to 'Accept' and no leads to 'Decline politely'.",
  states: [
    { id: "deadline", name: "Deadline fits?", sub: "my working hours", col: 0, row: 0 },
    { id: "pay", name: "Pay fair?", sub: "near my usual rate", col: 1, row: 0 },
    { id: "accept", name: "Accept", sub: "end", col: 2, row: 0 },
    { id: "ask", name: "Ask for time", sub: "one polite message", col: 0, row: 1 },
    { id: "decline", name: "Decline politely", sub: "end", col: 1, row: 1 },
  ],
  edges: [
    { from: "deadline", to: "pay", label: "yes" },
    { from: "deadline", to: "ask", label: "no" },
    { from: "ask", to: "pay", label: "agreed" },
    { from: "ask", to: "decline", label: "no more time" },
    { from: "pay", to: "accept", label: "yes" },
    { from: "pay", to: "decline", label: "no" },
  ],
  steps: [
    {
      state: "deadline",
      title: "A new offer arrives",
      note: "A bakery wants a logo for 40 dollars, ready in 2 days. Lina reads the whole message before she answers, so she does not miss a detail. Then she starts at the first question.",
      chips: ["logo for a bakery", "40 dollars", "due in 2 days"],
    },
    {
      state: "deadline",
      edge: 1,
      tone: "warn",
      outcome: "no",
      title: "Question 1: does the deadline fit?",
      note: "Lina has electricity for about 4 hours each evening. A good logo takes her about 12 hours, so 2 days is too short. The answer is no, so she follows the no arrow.",
      chips: ["needs about 12 hours", "has about 8 hours in 2 days"],
    },
    {
      state: "ask",
      edge: 2,
      title: "Ask for more time",
      note: "She writes one polite message: 'I would love to do this. Could you give me 4 days, so I can do it well?' The client agrees, so she follows the agreed arrow.",
      chips: ["asked for 4 days", "client agreed"],
    },
    {
      state: "pay",
      edge: 4,
      outcome: "yes",
      title: "Question 2: is the pay fair?",
      note: "Lina usually charges between 35 and 50 dollars for a simple logo. 40 dollars is inside that range, so the answer is yes.",
      chips: ["usual rate: 35 to 50", "offer: 40"],
    },
    {
      state: "accept",
      tone: "good",
      outcome: "accepted",
      title: "End: accept the offer",
      note: "Lina accepts, with the new deadline written in her reply. Every box on the way gave her a clear reason she can explain to anyone.",
    },
    {
      state: "decline",
      edge: 5,
      tone: "bad",
      outcome: "declined",
      title: "Another offer, the same flowchart",
      note: "A week later someone offers 5 dollars for a logo 'with unlimited changes'. The deadline fits, but at 'Pay fair?' the answer is no, so the flowchart says decline politely. The chart does not get tired or tempted.",
      chips: ["5 dollars", "unlimited changes", "pay fair? no"],
    },
  ],
  tryThis: [
    "Before step 2, predict which arrow Lina follows at 'Deadline fits?'. Then check.",
    "Find the path an offer takes when the client says no to more time. Which box does it end in?",
  ],
  limits:
    "This flowchart asks only two questions. A real one might also ask whether the work is safe and legal, whether Lina has the skills, or whether she already has too much work. Every flowchart leaves things out: that is fine if you know what you left out.",
};
