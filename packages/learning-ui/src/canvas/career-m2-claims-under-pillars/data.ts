import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 16 (career-brand), module 2, chapter 2.2 (spec beat 3): Claims without proof turn grey
// Data copied from canvas-specs/career-m2-claims-under-pillars.md. Characters and numbers are fictional and illustrative.

export const CLAIMS_UNDER_PILLARS_BUCKETS: SortBucket[] = [
  { id: "holds", label: "Holds a pillar", sub: "a proof is attached" },
  { id: "needs", label: "Needs a proof first", sub: "only a word so far" },
];

export const CLAIMS_UNDER_PILLARS_CARDS: SortCard[] = [
  {
    id: "report",
    text: "Cut a report's p95 from 4.6 s to 0.41 s",
    answer: "holds",
    why: {
      needs: "It has numbers, a window and a place to check.",
    },
  },
  {
    id: "communicator",
    text: "Great communicator",
    answer: "needs",
    why: {
      holds: "No example is attached yet.",
    },
  },
  {
    id: "invoice",
    text: "Saved a print shop about 3 hours a week, net",
    answer: "holds",
    why: {
      needs: "A timing sheet backs it, net of upkeep.",
    },
  },
  {
    id: "cloud",
    text: "Expert in cloud",
    answer: "needs",
    why: {
      holds: "Nothing in her notes proves it.",
    },
  },
  {
    id: "key",
    text: "Replaced a leaked key and turned on push protection",
    answer: "holds",
    why: {
      needs: "The revoked key and the setting can be shown.",
    },
  },
  {
    id: "passionate",
    text: "Passionate about performance",
    answer: "needs",
    why: {
      holds: "A feeling is not a proof.",
    },
  },
  {
    id: "loadtest",
    text: "Cut an endpoint's p95 from 820 ms to 95 ms in a load test",
    answer: "holds",
    why: {
      needs: "The same script, data and laptop back it.",
    },
  },
  {
    id: "teamplayer",
    text: "Team player",
    answer: "needs",
    why: {
      holds: "Which team, and what did she do?",
    },
  },
];

export const careerM2ClaimsUnderPillars: CustomCanvasSpec = {
  kind: "custom",
  title: "Claims without proof turn grey",
  purpose: "Sort eight claims from Areej's notes into 'holds a pillar' and 'needs a proof first', with a short reason after each wrong try.",
  limits: "Whether a claim 'has proof' here means the notes already point to a proof. 'Great communicator' could hold a pillar once an example is attached. Areej and her numbers are fictional and illustrative.",
  component: makeSorterCanvas({
    buckets: CLAIMS_UNDER_PILLARS_BUCKETS,
    cards: CLAIMS_UNDER_PILLARS_CARDS,
    deckLabel: "Areej's claim",
    prompt: "Can this claim hold up a pillar?",
    hint: "Tap the bucket this claim belongs in, or drag the card onto it.",
    endNote: "A pillar stands on claims that come with a proof. The grey ones are not wrong; they just need an example or a number first.",
  }),
};
