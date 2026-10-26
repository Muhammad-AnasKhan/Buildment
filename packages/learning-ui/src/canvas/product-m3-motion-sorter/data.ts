import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.5: sort eight movements on Halaqa (fictional) into
// "Has a job" and "Decoration". The rule that separates them: motion has a
// job when it shows a change the person needs (work in progress, something
// new, something moved, a value changed). Three cards look wrong by their
// surface: a spinner loops forever (but has a job), a fade on scroll looks
// mild (but shows no change), and the same fade after a join (a job).

export const MOTION_BUCKETS: SortBucket[] = [
  { id: "job", label: "Has a job", sub: "shows a change" },
  { id: "decoration", label: "Decoration", sub: "only looks lively" },
];

export const MOTION_CARDS: SortCard[] = [
  {
    id: "spinner",
    text: "A spinner turns while a join is being sent",
    answer: "job",
    why: {
      decoration: "It loops, but only while the join is in progress. Motion that shows a change has a job, however it looks.",
    },
  },
  {
    id: "star",
    text: "A star beside the title spins all the time",
    answer: "decoration",
    why: {
      job: "It shows no change. If you remove it, nobody loses any information, so it is decoration.",
    },
  },
  {
    id: "row",
    text: "A new group row slides in once at the top",
    answer: "job",
    why: {
      decoration: "It plays once and shows that something new appeared. Showing a change is a job.",
    },
  },
  {
    id: "pulse",
    text: "The Join button pulses to draw the eye",
    answer: "decoration",
    why: {
      job: "A pulse that repeats shows no change. It competes with the time and the seats, so it is decoration.",
    },
  },
  {
    id: "count",
    text: "The seats count ticks from 2 to 1 after a join",
    answer: "job",
    why: {
      decoration: "The number really changed. A tick shows that a value changed, and that is a job.",
    },
  },
  {
    id: "scroll-fade",
    text: "Each card fades in as you scroll past it",
    answer: "decoration",
    why: {
      job: "It looks mild, but nothing changed for the person. The card was always there, so the fade is decoration.",
    },
  },
  {
    id: "tick-fade",
    text: "A green tick fades in once after a join",
    answer: "job",
    why: {
      decoration: "It is the same kind of fade as the cards, but this one shows that the join worked. A change, so a job.",
    },
  },
  {
    id: "badge",
    text: "A badge bounces every few seconds",
    answer: "decoration",
    why: {
      job: "It repeats and shows no change. Motion with no change to show is decoration, and it is the first to cut.",
    },
  },
];

export const productM3MotionSorter: CustomCanvasSpec = {
  kind: "custom",
  title: "Does the motion have a job?",
  purpose: "Sort eight movements on Halaqa into those that show a change and those that only decorate, with a short reason after each wrong try.",
  limits:
    "Real cases are less clear. A motion can show a change and still be too long, too large or too frequent. The sorting rule here is the course's own summary, not a standard. Halaqa is a fictional app.",
  component: makeSorterCanvas({
    buckets: MOTION_BUCKETS,
    cards: MOTION_CARDS,
    deckLabel: "Halaqa movement",
    prompt: "Does this movement have a job?",
    hint: "Tap the bucket this card belongs in, or drag the card onto it.",
    endNote: "Motion has a job when it shows a change: work in progress, something new, something moved, a value changed. Anything else is decoration.",
  }),
};
