import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 16 (career-brand), module 7, chapter 7.4 beat 4: you have three
// personalised notes this month. Sort eight contacts into "use a note",
// "connect only" and "comment first". This is a course method built on
// LinkedIn's own facts (checked 2026-10), not a LinkedIn rule. LinkedIn's
// pages differ on three or five notes a month, so the course plans for three.
// Policy forbids promotional invitations to people you do not know.

export const NOTE_BUCKETS: SortBucket[] = [
  { id: "note", label: "Use a note", sub: "specific, some tie" },
  { id: "connect", label: "Connect only", sub: "you already talk" },
  { id: "comment", label: "Comment first", sub: "then ask once seen" },
];

export const NOTE_CARDS: SortCard[] = [
  {
    id: "classmate",
    text: "A classmate you already talk to every week",
    answer: "connect",
    why: { note: "You already talk. Save your notes for others.", comment: "You know them. You need no comment first." },
  },
  {
    id: "ta",
    text: "Your former teaching assistant, now a backend engineer abroad",
    answer: "note",
    why: { connect: "You have not spoken for a while. A note helps.", comment: "He knows you. Ask him directly, with a note." },
  },
  {
    id: "founder",
    text: "A founder you have never spoken to",
    answer: "comment",
    why: { note: "Comment first so they see your name. A note comes later.", connect: "A comment first gives them a reason to accept." },
  },
  {
    id: "teammate",
    text: "A teammate from your university project",
    answer: "connect",
    why: { note: "You know them. A plain request is enough.", comment: "You know them. You need no comment first." },
  },
  {
    id: "engineer",
    text: "An engineer two connections away who commented on a PostgreSQL post",
    answer: "note",
    why: { connect: "A short note about that post gives a reason.", comment: "You have a clear shared topic. A note fits." },
  },
  {
    id: "question",
    text: "Someone who posted a question your project answers",
    answer: "comment",
    why: { note: "Answer in a comment first. It helps others too.", connect: "Answer them where they asked, then connect." },
  },
  {
    id: "colleague",
    text: "A colleague from your internship who messages you already",
    answer: "connect",
    why: { note: "You already talk. Keep the note for someone else.", comment: "You already talk. A comment is not needed." },
  },
  {
    id: "company",
    text: "An engineer at a company you like who has never heard of you",
    answer: "comment",
    why: { note: "Build a reason first with a useful comment.", connect: "A comment first gives them a reason to accept." },
  },
];

export const careerM7SpendTheNotes: CustomCanvasSpec = {
  kind: "custom",
  title: "Spend a small note budget",
  purpose:
    "You have three personalised notes this month. Sort eight contacts into 'use a note', 'connect only' and 'comment first', with a short reason after each wrong try.",
  limits:
    "A course method, not a LinkedIn rule. Checked 2026-10; LinkedIn's pages differ on whether the monthly allowance is three or five, so the course plans for three. Policy forbids promotional invitations to people you do not know.",
  component: makeSorterCanvas({
    buckets: NOTE_BUCKETS,
    cards: NOTE_CARDS,
    deckLabel: "Contact",
    prompt: "How do you reach this person?",
    hint: "Tap how you would reach them, or drag the card onto it.",
    endNote:
      "Three notes a month go to people you have a specific reason to write to. Connect plainly when you already talk, and comment first with strangers.",
  }),
};
