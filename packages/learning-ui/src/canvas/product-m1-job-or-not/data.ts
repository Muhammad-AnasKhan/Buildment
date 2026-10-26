import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.3: nine lines that describe an app, sorted into a
// job, a persona and a feature. The rule: a job has a situation and something
// the person wants to do, and it still makes sense with the app removed. A
// persona says who the person is. A feature says what the app has or does.
// Three cards are written so that the wording points to the wrong bucket.

export const JOB_BUCKETS: SortBucket[] = [
  { id: "job", label: "Job", sub: "situation and want" },
  { id: "persona", label: "Persona", sub: "a kind of person" },
  { id: "feature", label: "Feature", sub: "what the app has" },
];

export const JOB_CARDS: SortCard[] = [
  {
    id: "battery",
    text: "Battery low in the library: I want a seat by a socket.",
    answer: "job",
    why: {
      persona: "A persona says who the person is. This gives a situation and what the person wants to do.",
      feature: "A feature says what the app has. Take the app out and this still makes sense, so it is a job.",
    },
  },
  {
    id: "age",
    text: "Women and men aged 18 to 24 who use a phone all day.",
    answer: "persona",
    why: {
      job: "A job has a situation and a want. This only says who the people are.",
      feature: "A feature says what the app has. This describes people and names nothing to build.",
    },
  },
  {
    id: "list",
    text: "Search, chat, polls, voice rooms, streaks and badges.",
    answer: "feature",
    why: {
      job: "A job still makes sense without the app. This only lists what the app has.",
      persona: "A persona says who the person is. This lists things to build.",
    },
  },
  {
    id: "bus",
    text: "Class in 10 minutes: I want to know if the bus has left.",
    answer: "job",
    why: {
      persona: "A persona says who the person is. This gives a situation and a want.",
      feature: "A feature says what the app has. Take the app out and the sentence still makes sense.",
    },
  },
  {
    id: "far",
    text: "Third-year engineering students who live far from campus.",
    answer: "persona",
    why: {
      job: "It names a place, but no want. A job needs something the person wants to do.",
      feature: "A feature says what the app has. This describes a kind of person.",
    },
  },
  {
    id: "template-chat",
    text: "When I study, I want a chat in the app, so that I can chat.",
    answer: "feature",
    why: {
      job: "It uses the template, but the want is a feature. Take the app out and it makes no sense.",
      persona: "A persona says who the person is. This names a thing to build.",
    },
  },
  {
    id: "exam",
    text: "Before an exam, a student wants someone to revise with.",
    answer: "job",
    why: {
      persona: "A persona says who the person is. This gives a situation (before an exam) and a want.",
      feature: "A feature says what the app has. This names no feature, and it still makes sense without the app.",
    },
  },
  {
    id: "tidy",
    text: "A 20-year-old who studies alone and likes simple apps.",
    answer: "persona",
    why: {
      job: "A job has a situation and a want. This describes a kind of person.",
      feature: "A feature says what the app has. This describes a person's habits.",
    },
  },
  {
    id: "has",
    text: "Halaqa has group search, streaks and a leaderboard.",
    answer: "feature",
    why: {
      job: "A job still makes sense without the app. This says what the app has.",
      persona: "A persona says who the person is. This says what the app has.",
    },
  },
];

export const productM1JobOrNot: CustomCanvasSpec = {
  kind: "custom",
  title: "Job, persona or feature?",
  purpose: "Sort nine lines into a job, a persona or a feature, with the rule for the bucket in the reason after each wrong try.",
  limits:
    "Real briefs mix the three in one paragraph, and a persona can help in other ways, such as choosing words. The point here is narrow: only the job says what to put first on a screen. The lines are invented examples.",
  component: makeSorterCanvas({
    buckets: JOB_BUCKETS,
    cards: JOB_CARDS,
    deckLabel: "Line about an app",
    prompt: "Job, persona or feature?",
    hint: "Tap the bucket this line belongs in, or drag the card onto it.",
    endNote: "A job has a situation and a want, and it makes sense without the app. A persona says who the person is. A feature says what the app has.",
  }),
};
