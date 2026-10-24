import type { SequenceSpec } from "../renderers/sequence/types";

// Building Habits That Last course, chapter 2.3 "If-then plans".
// Lina's Monday with a vague intention ("practise sometime today") lets the
// moment pass; her Tuesday with an if-then plan ("if I finish my morning tea,
// then I open my writing notebook and write three sentences") lets the
// situation itself start the action. See spec.md.
export const ifThenMoment: SequenceSpec = {
  kind: "sequence",
  title: "Sometime today, or if-then?",
  purpose: "See how a vague plan lets the moment pass, while an if-then plan lets the moment start the action.",
  summary:
    "On Monday Lina plans to practise sometime today. She drinks her tea, starts work, and the day fills up; at 22:30 the practice is still not done. On Tuesday her plan says if I finish my morning tea, then I open my writing notebook and write three sentences. The empty glass starts the action, she writes three sentences, and then the busy day begins.",
  actors: [
    { name: "Lina", sub: "translator" },
    { name: "Morning tea", sub: "after Fajr" },
    { name: "Client work", sub: "on the laptop" },
    { name: "Notebook", sub: "writing" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "sometime today",
      title: "Monday: a plan with no moment",
      note: "Her sticky note says: practise English writing sometime today, three sentences. The habit is small, but the plan names no moment.",
      chips: ["three sentences", "no moment named"],
    },
    {
      from: 0,
      to: 1,
      label: "drinks tea",
      title: "After Fajr: her tea",
      note: "She drinks her tea and thinks about a client email. The moment passes. Nothing links the tea to the notebook.",
    },
    {
      from: 0,
      to: 2,
      label: "starts work",
      title: "The day fills up",
      note: "A long client call, a form her sister needs help with, a late lunch, an afternoon of translation. The plan is on a sticky note, but no step of the day belongs to it.",
    },
    {
      from: 0,
      to: 0,
      label: "too late",
      tone: "warn",
      outcome: "missed",
      title: "22:30: tomorrow",
      note: "She sees the note on her way to bed. She never decided not to practise. Sometime simply never became now.",
    },
    {
      from: 0,
      to: 0,
      label: "if tea, then write",
      title: "Tuesday: the plan names a moment",
      note: "If I finish my morning tea, then I open my writing notebook and write three sentences. A moment she will surely meet, and one first step she could film.",
      chips: ["if: tea finished", "then: open notebook"],
    },
    {
      from: 1,
      to: 0,
      label: "glass is empty",
      title: "The moment arrives",
      note: "She finishes her tea. The empty glass is the if. She does not have to carry the plan in her head: the situation reminds her.",
    },
    {
      from: 0,
      to: 3,
      label: "write 3 sentences",
      tone: "good",
      outcome: "done",
      title: "The first step",
      note: "She opens the notebook and writes three sentences about the morning. It takes about five minutes.",
    },
    {
      from: 0,
      to: 2,
      label: "starts work",
      title: "Then the busy day",
      note: "Client messages arrive and the day fills up, just as on Monday. But the writing is already done.",
    },
  ],
  tryThis: [
    "Before you step through, recall your prediction: on a busy day, does naming the moment help more than making the habit smaller? Then compare Monday and Tuesday, which have the same small habit.",
    "Count how many times Lina has to remember the plan on each day. On Monday, all day. On Tuesday, once, when the glass is empty.",
  ],
  limits:
    "A plan does not guarantee anything. Some mornings the tea will be late or a client will call at dawn. If-then plans make action more likely, not certain, and they help most with new habits that you really want.",
};
