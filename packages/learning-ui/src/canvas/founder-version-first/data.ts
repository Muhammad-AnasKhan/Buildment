import type { SequenceSpec } from "../renderers/sequence/types";

// The Founder Interview course, chapter 5.3 "The founder version".
// Yazan answers "What is the best technical thing you have done?" twice: first
// in jargon, where the founder stops following, then with the founder version
// (problem, what he built, the key choice, the result), where the founder asks
// a business question that leads to the next step. Facts match the chapter.
// See spec.md.
export const founderVersionFirst: SequenceSpec = {
  kind: "sequence",
  title: "Yazan's two answers to a founder",
  purpose: "See how a jargon answer loses a founder, and how a short founder version lets the founder ask for more.",
  summary:
    "The founder asks for Yazan's best technical work. Yazan answers with technical terms and the founder says they cannot follow. Yazan starts again with four parts: the problem, what he built, the key choice and the result. The founder asks a business question, Yazan answers it, and the conversation goes deeper.",
  actors: [
    { name: "Founder", sub: "does not code" },
    { name: "Yazan", sub: "backend developer" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "your best work?",
      title: "The question",
      note: "The founder of a small team that builds an invoicing app for freelancers asks: What is the best technical thing you have done? Yazan has about a minute to answer. Before you press Next: what would you say first?",
    },
    {
      from: 1,
      to: 0,
      label: "jargon answer",
      tone: "bad",
      outcome: "cannot follow",
      title: "Answer 1: the terms",
      note: "Yazan says: I moved the monthly report to an async worker with a queue, and the retries are idempotent. Every term is correct. None of them is explained, so the founder cannot tell what problem was solved. Before you press Next: what will the founder say?",
      chips: ["async worker", "queue", "idempotent retries"],
    },
    {
      from: 0,
      to: 1,
      label: "I cannot follow",
      tone: "warn",
      title: "The founder stops following",
      note: "The founder says: Sorry, I do not write code. What was the problem? The answer was true, but the founder has nothing to ask about except the words. Before you press Next: which four things would you choose to say?",
    },
    {
      from: 1,
      to: 1,
      label: "four parts",
      title: "Yazan starts again",
      note: "He picks four parts in user terms: the problem, what he built in one sentence, the key choice and the result. He leaves the terms out for now. Before you press Next: can you say the four parts in your own words?",
      chips: ["problem", "what I built", "key choice", "result"],
    },
    {
      from: 1,
      to: 0,
      label: "founder version",
      tone: "good",
      outcome: "founder follows",
      title: "Answer 2: the founder version",
      note: "Our biggest merchants waited about 40 minutes for their monthly report, and it failed nine times last month. I changed it so the report is built in the background, in parts, and a link is emailed when it is ready. I chose that over a night run because merchants ask at any time. Now the biggest report takes about 6 minutes, with no failures in two months. Before you press Next: what will the founder ask now?",
      chips: ["about 40 min to about 6 min", "9 failures to none"],
    },
    {
      from: 0,
      to: 1,
      label: "do they wait?",
      title: "A business question",
      note: "The founder asks: Does the merchant sit and wait while it builds? The founder now cares about the merchant, and that is the doorway Yazan wanted. Before you press Next: how would you answer, and when would you use the words background job?",
    },
    {
      from: 1,
      to: 0,
      label: "no, email link",
      tone: "good",
      outcome: "depth on request",
      title: "Yazan explains one term, in use",
      note: "No. They can close the page, and an email brings the link. That is why it is a background job. Now the term means something, and the founder can ask the next question or hand the talk to an engineer. What would you want to be asked next?",
    },
  ],
  tryThis: [
    "At step 4, say the four parts of a founder version in your own words before you look at step 5.",
    "At step 2, which words would a founder need explained? Which of them could Yazan leave out for now?",
  ],
  limits:
    "This is one conversation with one founder who asks one helpful question. Real founders may ask other things, and some will want more detail at once. The numbers are Yazan's own, from the chapter. The aim is to give a version that a person outside your field can follow, and then to let them choose the next question.",
};
