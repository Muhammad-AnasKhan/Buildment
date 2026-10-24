import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Chapter 1.2: sort Hana's list for Daftar (fictional) into the chapter's
// three kinds of requirement. Every card comes from the chapter's own text.

export const REQUIREMENT_BUCKETS: SortBucket[] = [
  { id: "functional", label: "Functional", sub: "what it does" },
  { id: "non-functional", label: "Non-functional", sub: "how well" },
  { id: "constraint", label: "Constraint", sub: "limits you accept" },
];

export const REQUIREMENT_CARDS: SortCard[] = [
  {
    id: "upload",
    text: "A student can upload a PDF note for a course.",
    answer: "functional",
    why: {
      "non-functional": "It is an action a user takes, with no how-well target.",
      constraint: "Nobody forces this on the team. It is a feature users need.",
    },
  },
  {
    id: "search-speed",
    text: "99 of every 100 searches answer in under 1 second.",
    answer: "non-functional",
    why: {
      functional: "Search is the feature. This card says how fast it must be.",
      constraint: "It is a target the team chose, not a limit put on the team.",
    },
  },
  {
    id: "two-engineers",
    text: "Two engineers build and run the whole app.",
    answer: "constraint",
    why: {
      functional: "No user does anything here. It limits who builds Daftar.",
      "non-functional": "It sets no target for Daftar. It limits the team.",
    },
  },
  {
    id: "find-notes",
    text: "A student can find every note for CS101.",
    answer: "functional",
    why: {
      "non-functional": "There is no speed or uptime here, only an action.",
      constraint: "It is something users do, not a limit on the team.",
    },
  },
  {
    id: "never-lost",
    text: "A note marked saved is never lost.",
    answer: "non-functional",
    why: {
      functional: "Saving is the feature. Never losing it says how well.",
      constraint: "It is a promise about quality, not a fact you must accept.",
    },
  },
  {
    id: "six-weeks",
    text: "It must be ready in 6 weeks, before the exams.",
    answer: "constraint",
    why: {
      functional: "No user action here. The exam calendar fixes the date.",
      "non-functional": "A deadline limits the project. It sets no quality target.",
    },
  },
  {
    id: "search-fresh",
    text: "A new note shows up in search within 1 minute.",
    answer: "non-functional",
    why: {
      functional: "Search already exists. The 1 minute says how fresh it is.",
      constraint: "The team chose this target. It is not forced on them.",
    },
  },
  {
    id: "university-sign-in",
    text: "Students must sign in with their university accounts.",
    answer: "constraint",
    why: {
      functional: "Signing in is a feature; these accounts are forced on you.",
      "non-functional": "It sets no speed or uptime. An existing system limits you.",
    },
  },
];

export const sysdesignM1RequirementSorter: CustomCanvasSpec = {
  kind: "custom",
  title: "Sort Hana's requirements",
  purpose: "Sort eight of Hana's requirements for Daftar into functional, non-functional and constraint, with a short reason after each wrong try.",
  limits:
    "Real lists are messier: one sentence often mixes a feature and a target, and some lines, such as cost, can be read as a target or as a limit. Daftar and its list are fictional.",
  component: makeSorterCanvas({
    buckets: REQUIREMENT_BUCKETS,
    cards: REQUIREMENT_CARDS,
    deckLabel: "Daftar requirement",
    prompt: "Which bucket does this card go in?",
    hint: "Tap the bucket this card belongs in, or drag the card onto it.",
    endNote: "An action is functional. A how-well target is non-functional. A fact you must accept is a constraint.",
  }),
};
