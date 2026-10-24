import type { SequenceSpec } from "../renderers/sequence/types";

// Founder Interview course, chapter 3.3 "Real reasons, not tidy ones".
// Karam gives the founder a tidy reason for the checkout redesign. It stands at
// the first why and contradicts another answer by the third. Then he goes back
// to what he knew at the time and gives the real reason, with the decision he
// made inside it. Each note ends with a short question that the next step
// answers. See spec.md.
export const tidyReasonBreaks: SequenceSpec = {
  kind: "sequence",
  title: "A tidy reason fails at the third why",
  purpose: "See a reason made up afterwards stand at the first why and fall apart by the third, and see the real reason from the time stand all the way down.",
  summary:
    "The founder asks Karam why he redesigned the checkout page. He says: to reduce friction. The second why gets a theory about too many fields. The third why gets a different answer: his manager asked him. The tidy reason has contradicted itself. Karam goes back to his notes from the time and gives the real reason, my manager asked, and then the decision he made inside that request.",
  actors: [
    { name: "Founder", sub: "asks why" },
    { name: "Karam", sub: "answers" },
    { name: "His notes", sub: "that week" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "why a redesign?",
      title: "Why 1: the question",
      note: "The founder reads Karam's resume line about leading the checkout redesign and asks why the team did a redesign at all. Before you press Next: what will Karam say first?",
    },
    {
      from: 1,
      to: 0,
      label: "reduce friction",
      tone: "warn",
      outcome: "sounds right",
      title: "A tidy reason",
      note: "Karam says: to reduce friction in the funnel. That means: to remove what stops visitors from buying. It is a normal reason and it sounds strategic. Nothing in it can be checked yet. Before you press Next: what will the founder ask?",
      chips: ["not the reason at the time"],
    },
    {
      from: 0,
      to: 1,
      label: "what friction?",
      title: "Why 2: what did you see?",
      note: "The founder asks what friction Karam found, and what he looked at to find it. Before you press Next: can Karam name something he saw?",
    },
    {
      from: 1,
      to: 0,
      label: "too many fields",
      tone: "warn",
      outcome: "a theory",
      title: "A reason that sounds right",
      note: "Karam says the old page had too many fields. This is a theory that fits the first answer. He did not count the fields or watch anyone use the page, and he is building the reason as he speaks. Before you press Next: what third question tests it?",
    },
    {
      from: 0,
      to: 1,
      label: "who saw that?",
      title: "Why 3: who found it?",
      note: "The founder asks: did you find that yourself, or did someone tell you? Before you press Next: what is the true answer, and does it match the first reason?",
    },
    {
      from: 1,
      to: 0,
      label: "my manager asked",
      tone: "bad",
      outcome: "contradiction",
      title: "The tidy reason fails",
      note: "Karam says his manager asked him to build it. Now there are two reasons: friction he saw, and a request. The first one was added afterwards, and the founder starts to doubt the rest of the line too. Before you press Next: how can Karam find the reason he really had?",
    },
    {
      from: 1,
      to: 2,
      label: "what did I know?",
      title: "Go back to the time",
      note: "A better way: before the interview, Karam writes down what he knew, what he wanted and who asked, as it was that week. His notes are not how it turned out. They are how it looked then. Before you press Next: what do you think the notes say?",
      chips: ["what I knew", "what I wanted", "who asked"],
    },
    {
      from: 2,
      to: 1,
      label: "request, no data",
      tone: "good",
      outcome: "the real reason",
      title: "What the notes say",
      note: "On Monday his manager said the redesign was planned. The designer's screens were ready. The deadline was two weeks. Karam had not looked at any data before he started. Before you press Next: what part of this was still Karam's own decision?",
      chips: ["manager asked", "screens ready", "two weeks"],
    },
    {
      from: 1,
      to: 0,
      label: "I chose one page",
      tone: "good",
      outcome: "still stands",
      title: "The real reason, and the decision inside it",
      note: "Karam says: my manager asked me, and inside that I decided to build the form as one page, because the designer's screens allowed both and one page was about two days faster. I did not test which version sells more. A fourth why only finds more true facts.",
      chips: ["not my decision to redesign", "my decision: one page"],
    },
  ],
  tryThis: [
    "Before step 6, predict what Karam will say when the founder asks who found the friction. Then check.",
    "At step 9, find the two parts of the answer: what was not Karam's decision, and what was. Why does the second part make the first one safe to say?",
  ],
  limits:
    "This is one conversation with one possible path. People are often sure of their reasons and wrong about them, so the notes help but cannot prove what happened in the past. A real founder may ask different whys. The point is the pattern: a reason made up afterwards needs more invention at every why, and a true one does not.",
};
