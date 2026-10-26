import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import type { SorterConfig } from "../primitives/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 11.2: Manar, a fictional freelance web developer, has
// eight calls in one afternoon for a café client. Each card is sorted with the
// chapter's three questions: a person's word first, then "can I check it and
// undo it cheaply", then "my facts and my taste".

export const WHO_LEADS_BUCKETS: SortBucket[] = [
  { id: "draft", label: "AI drafts", sub: "you decide" },
  { id: "lead", label: "You lead", sub: "AI helps" },
  { id: "people", label: "People only", sub: "a person's call" },
];

export const WHO_LEADS_CARDS: SortCard[] = [
  {
    id: "subject-lines",
    text: "Ten subject lines for the café's weekly newsletter.",
    answer: "draft",
    why: {
      lead: "A wrong line costs nothing, and she reads all ten at once.",
      people: "No consent, rule or relationship is at stake in a subject line.",
    },
  },
  {
    id: "monthly-query",
    text: "A 40-line query for the monthly sales report.",
    answer: "draft",
    why: {
      lead: "She runs it on a copy and checks the totals, so the AI can draft it.",
      people: "A query needs nobody's consent or trust. She can test it herself.",
    },
  },
  {
    id: "test-ideas",
    text: "A first list of tests for a small price function.",
    answer: "draft",
    why: {
      lead: "A missing test costs little here, and she reviews the whole list.",
      people: "Nothing here needs a person's word. It is a list she can read and cut.",
    },
  },
  {
    id: "layout",
    text: "Which of three working menu layouts fits the café's phones.",
    answer: "lead",
    why: {
      draft: "All three work. Only she knows the weak phones, so the choice is hers.",
      people: "No consent or rule decides it. Her facts and taste do, with AI help.",
    },
  },
  {
    id: "deploy",
    text: "Putting the change on the café's live order page.",
    answer: "lead",
    why: {
      draft: "A bad change reaches real customers and is hard to undo. She leads.",
      people: "Nobody else must agree. She decides and runs it, and AI can list the steps.",
    },
  },
  {
    id: "plan",
    text: "What to build in the next month of her own project.",
    answer: "lead",
    why: {
      draft: "AI does not know her hours or goals, so its plan is only a start.",
      people: "She owns the plan and needs nobody's consent. AI can check her dates.",
    },
  },
  {
    id: "late",
    text: "Telling the client the project will be two weeks late.",
    answer: "people",
    why: {
      draft: "AI can draft notes, but the client should hear this from her.",
      lead: "Facts are not the issue here. The relationship needs a person's voice.",
    },
  },
  {
    id: "applicant",
    text: "Choosing which of two applicants gets the café's part-time job.",
    answer: "people",
    why: {
      draft: "A ranking by AI would make the choice in practice. A person must.",
      lead: "A person's job is at stake. The applicants deserve a person's decision.",
    },
  },
];

export const WHO_LEADS_THIS_CALL: SorterConfig = {
  buckets: WHO_LEADS_BUCKETS,
  cards: WHO_LEADS_CARDS,
  deckLabel: "Manar's afternoon",
  prompt: "Who leads this call?",
  hint: "Tap the bucket this call belongs in, or drag the card onto it.",
  endNote: "A person's word is people only. Check and undo cheaply: AI drafts. Your facts or taste: you lead.",
};

export const whoLeadsThisCall: CustomCanvasSpec = {
  kind: "custom",
  title: "Who leads this call?",
  purpose: "Sort eight calls from Manar's afternoon into AI drafts and you decide, you lead and AI helps, and people only, with a short reason after each wrong try.",
  limits:
    "Real calls mix the three: one task can hold a draft, a call to lead and a conversation only a person can have. The buckets come from the course's own three questions, not from a law or a study, and a company rule or a client's contract can move a card. Manar and the café are fictional.",
  component: makeSorterCanvas(WHO_LEADS_THIS_CALL),
};
