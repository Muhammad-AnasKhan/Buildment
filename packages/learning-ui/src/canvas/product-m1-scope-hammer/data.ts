import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.4: nine of Maryam's fourteen Halaqa features
// (fictional) sorted for a 12-hour appetite and the job "find two or three
// classmates to revise with tonight or tomorrow". The other five are in the
// chapter's fold.

export const SCOPE_BUCKETS: SortBucket[] = [
  { id: "must", label: "Must have", sub: "job fails without" },
  { id: "nice", label: "Nice to have", sub: "helps, can wait" },
  { id: "later", label: "Not now", sub: "wait for later" },
];

export const SCOPE_CARDS: SortCard[] = [
  {
    id: "search",
    text: "Group search: find a group for my course.",
    answer: "must",
    why: {
      nice: "The job is to find a group. Without search, nobody can.",
      later: "This is the heart of the job, so it cannot wait.",
    },
  },
  {
    id: "notify",
    text: "Notifications: remind me before a group meets.",
    answer: "nice",
    why: {
      must: "The job works without it. A student can open the app tonight.",
      later: "It helps this job and it is small. Mark it with a tilde.",
    },
  },
  {
    id: "leaderboard",
    text: "Leaderboard: rank students by study time.",
    answer: "later",
    why: {
      must: "Nobody needs a rank to find a group tonight.",
      nice: "It does not help this job at all. It serves a different one.",
    },
  },
  {
    id: "create",
    text: "Create group: start one when none fits.",
    answer: "must",
    why: {
      nice: "If no group fits, the student is stuck. The job fails without it.",
      later: "A student with no group has nowhere else to go.",
    },
  },
  {
    id: "streaks",
    text: "Streaks: count the days in a row.",
    answer: "later",
    why: {
      must: "The job is one night before an exam, not a habit.",
      nice: "It serves the weekly habit job, not this one.",
    },
  },
  {
    id: "calendar",
    text: "Calendar sync: add a group to my calendar.",
    answer: "nice",
    why: {
      must: "A student can still join and go. The job works without it.",
      later: "It helps the same job and it is small. Mark it with a tilde.",
    },
  },
  {
    id: "voice",
    text: "Voice rooms: talk inside the app.",
    answer: "later",
    why: {
      must: "An online group can meet on a call link. The job does not need rooms.",
      nice: "It is a big build. A call link answers the same problem for less.",
    },
  },
  {
    id: "ai-notes",
    text: "AI summary: shorten my notes.",
    answer: "later",
    why: {
      must: "It does not help a student find classmates.",
      nice: "It serves a different job, studying alone, and it is a big build.",
    },
  },
  {
    id: "chat",
    text: "Chat: talk inside each group.",
    answer: "later",
    why: {
      must: "Classmates already message in apps they have. The job fails at finding a group.",
      nice: "It is a big build, and what students do today already works.",
    },
  },
];

export const productM1ScopeHammer: CustomCanvasSpec = {
  kind: "custom",
  title: "Cut Halaqa to fit 12 hours",
  purpose:
    "Sort nine of Halaqa's fourteen features into must have, nice to have and not now, for a 12-hour appetite and the job of finding classmates tonight, with a short reason after each wrong try.",
  limits:
    "Another job or another team could sort these cards differently. The answers follow from this job, this time budget and what students do today. Halaqa is fictional, and five of its fourteen features are not on the cards.",
  component: makeSorterCanvas({
    buckets: SCOPE_BUCKETS,
    cards: SCOPE_CARDS,
    deckLabel: "Halaqa feature",
    prompt: "Must have, nice to have, or not now?",
    hint: "Tap the bucket this feature belongs in, or drag the card onto it.",
    endNote: "Ask what fails without it, who it affects and what people do today. Mark small helpers with a tilde. Keep the rest for later.",
  }),
};
