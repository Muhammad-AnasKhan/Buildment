import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 8.5 "Habits that build trust in a team": sort eight
// team habits, some with AI in the loop, by whether they build or erode a
// teammate's trust. The buckets are the course's reading of B75 (code review
// standard), B76 (psychological safety) and B77 (written, asynchronous
// updates), plus the explain-back rule of chapter 7.4. The cards are made-up
// examples, not real people or teams.

export const TRUST_BUCKETS: SortBucket[] = [
  { id: "builds", label: "Builds trust", sub: "teammates can rely on it" },
  { id: "erodes", label: "Erodes trust", sub: "teammates must guess" },
];

export const TRUST_CARDS: SortCard[] = [
  {
    id: "small-pr-ai",
    text: "A 40-line pull request: what AI drafted, what you checked.",
    answer: "builds",
    why: {
      erodes: "It is small and explained, so a reviewer can read it in minutes.",
    },
  },
  {
    id: "friday-update",
    text: "A Friday update: done, next, and one blocker you named.",
    answer: "builds",
    why: {
      erodes: "A short written update lets the team plan around you without a meeting.",
    },
  },
  {
    id: "quiet-days",
    text: "Five quiet days, then 'almost done' on deadline day.",
    answer: "erodes",
    why: {
      builds: "Nobody could see the problem early, so nobody could help in time.",
    },
  },
  {
    id: "clear-improvement",
    text: "Approving a clear improvement, plus one optional note.",
    answer: "builds",
    why: {
      erodes: "A change that clearly improves the code should not wait for perfect.",
    },
  },
  {
    id: "huge-ai-pr",
    text: "A 1,200-line pull request of AI code that you cannot explain.",
    answer: "erodes",
    why: {
      builds: "If you cannot explain it, the reviewer must understand it alone.",
    },
  },
  {
    id: "silent-call",
    text: "A call decides something and nobody writes it down.",
    answer: "erodes",
    why: {
      builds: "People who missed the call must guess what was decided.",
    },
  },
  {
    id: "ask-day-one",
    text: "Asking on day 1: what you tried and where you are stuck.",
    answer: "builds",
    why: {
      erodes: "An early, specific question costs a teammate minutes, not days.",
    },
  },
  {
    id: "stuck-a-week",
    text: "Staying stuck for a week so nobody thinks you are slow.",
    answer: "erodes",
    why: {
      builds: "Hiding a problem feels safe, but it costs the team a week.",
    },
  },
];

export const trustOrErode: CustomCanvasSpec = {
  kind: "custom",
  title: "Builds trust or erodes it?",
  purpose: "Sort eight team habits, some with AI in the loop, into 'builds trust' and 'erodes trust', with a short reason after each wrong try.",
  limits:
    "The cards are made-up examples and the buckets are this course's reading of three practices from large companies: Google's code review standard, Google's team research on psychological safety, and GitLab's written updates. They are company practices, not proof that one way is better everywhere. Real teams differ.",
  component: makeSorterCanvas({
    buckets: TRUST_BUCKETS,
    cards: TRUST_CARDS,
    deckLabel: "Team habit",
    prompt: "Does this build trust or erode it?",
    hint: "Tap the bucket this habit belongs in, or drag the card onto it.",
    endNote: "Small, explained, early and written builds trust. Big, hidden, late and unwritten erodes it.",
  }),
};
