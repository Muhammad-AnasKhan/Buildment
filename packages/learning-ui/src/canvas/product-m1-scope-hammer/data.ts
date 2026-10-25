import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.4: nine of Maryam's fourteen Halaqa features
// (fictional) sorted for a 12-hour appetite and the job "find two or three
// classmates to revise with tonight or tomorrow". The other five are in the
// chapter's fold. The rule for each bucket is stated in every reason:
// Must have: the job fails without it. Nice to have: the job works without
// it, but it makes this same job easier and it is small. Not now: it does not
// make this job easier, whatever its size (a different job, or students
// already do it in another app).

export const SCOPE_BUCKETS: SortBucket[] = [
  { id: "must", label: "Must have", sub: "job fails without" },
  { id: "nice", label: "Nice to have", sub: "eases this job" },
  { id: "later", label: "Not now", sub: "does not ease it" },
];

export const SCOPE_CARDS: SortCard[] = [
  {
    id: "search",
    text: "Group search: find a group for my course.",
    answer: "must",
    why: {
      nice: "The job is to find a group. A nice to have is something the job works without, and this is not.",
      later: "Without search the job fails. Not now is for what does not help this job.",
    },
  },
  {
    id: "notify",
    text: "Notifications: remind me before a group meets.",
    answer: "nice",
    why: {
      must: "The job works without it: a student can open the app tonight. Must have means the job fails without it.",
      later: "It makes this job easier with a reminder, and it is small. Not now is for what does not help this job.",
    },
  },
  {
    id: "leaderboard",
    text: "Leaderboard: rank students by study time.",
    answer: "later",
    why: {
      must: "Nobody needs a rank to find a group tonight. Must have means the job fails without it.",
      nice: "It serves a different job and does not ease finding a group. A nice to have must ease this job.",
    },
  },
  {
    id: "create",
    text: "Create group: start one when none fits.",
    answer: "must",
    why: {
      nice: "With no group that fits, the student is stuck. A nice to have is something the job works without.",
      later: "It helps this job directly: with no group that fits, the student is stuck. Not now is for what does not.",
    },
  },
  {
    id: "themes",
    text: "Profile themes: pick a colour for my profile.",
    answer: "later",
    why: {
      must: "Nobody fails to find a group because of a colour. Must have means the job fails without it.",
      nice: "It is small, but small is not enough. A nice to have must ease this job, and a colour does not.",
    },
  },
  {
    id: "calendar",
    text: "Calendar sync: add a group to my calendar.",
    answer: "nice",
    why: {
      must: "A student can still join and go, so the job works without it. Must have means the job fails without it.",
      later: "It helps this same job and it is small. Not now is for what does not help this job.",
    },
  },
  {
    id: "voice",
    text: "Voice rooms: talk by voice inside the app.",
    answer: "later",
    why: {
      must: "An online group can meet on a call link, so the job works without rooms.",
      nice: "It does not ease finding a group, and a call link answers the same need for less work.",
    },
  },
  {
    id: "streaks",
    text: "Streaks: count the days in a row.",
    answer: "later",
    why: {
      must: "The job is one night before an exam, not a habit. Must have means the job fails without it.",
      nice: "It serves a different job, the weekly habit. A nice to have must ease this same job.",
    },
  },
  {
    id: "chat",
    text: "Chat: talk inside each group.",
    answer: "later",
    why: {
      must: "The job fails at finding a group, not at talking. Classmates already message in apps they have.",
      nice: "It does not ease finding a group, and students already talk elsewhere. A nice to have must ease this job.",
    },
  },
];

export const productM1ScopeHammer: CustomCanvasSpec = {
  kind: "custom",
  title: "Cut Halaqa to fit 12 hours",
  purpose:
    "Sort nine of Halaqa's fourteen features into must have, nice to have and not now. The time is 12 hours and the job is finding classmates tonight. Each wrong try shows the rule for the bucket.",
  limits:
    "Another job or another time budget could sort these cards differently. The answers follow from this job, this time budget and what students do today. Halaqa is fictional, and five of its fourteen features are not on the cards.",
  component: makeSorterCanvas({
    buckets: SCOPE_BUCKETS,
    cards: SCOPE_CARDS,
    deckLabel: "Halaqa feature",
    prompt: "Must have, nice to have, or not now?",
    hint: "Tap the bucket this feature belongs in, or drag the card onto it.",
    endNote: "Must have: the job fails without it. Nice to have: the job works without it, it eases this job, and it is small. Not now: it does not ease this job, whatever its size.",
  }),
};
