import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 16 (career-brand), module 3, chapter 3.3 beat 2: Match the work to its proof.
// Every kind of work leaves a different trace. A query fix leaves plans and charts, a cleanup leaves a pull request and tests, a migration leaves row counts. For a security fix the proof is the fix, never the secret.
// Sorter. Fictional people; every card is a made-up piece of work.

export const PROOF_BUCKETS: SortBucket[] = [
  {
    "id": "charts",
    "label": "Charts, plans",
    "sub": "dashboards, bills"
  },
  {
    "id": "code",
    "label": "Code, settings",
    "sub": "pull requests, tests"
  },
  {
    "id": "counts",
    "label": "Counts, sheets",
    "sub": "rows, minutes, users"
  }
];

export const PROOF_CARDS: SortCard[] = [
  {
    "id": "query",
    "text": "Fixed a slow database query",
    "answer": "charts",
    "why": {
      "code": "A query fix shows in plans and latency.",
      "counts": "Counts do not show speed. A plan pair does."
    }
  },
  {
    "id": "cleanup",
    "text": "Cleaned up a messy module",
    "answer": "code",
    "why": {
      "charts": "Cleanup shows in the pull request and tests.",
      "counts": "A cleanup has no rows or minutes to count."
    }
  },
  {
    "id": "key",
    "text": "Fixed a leaked key",
    "answer": "code",
    "why": {
      "charts": "Show the revocation and the setting, not a chart.",
      "counts": "There is nothing to count. Show the fix."
    }
  },
  {
    "id": "migration",
    "text": "Moved old data into a new database",
    "answer": "counts",
    "why": {
      "charts": "Row counts before and after prove a migration.",
      "code": "Code shows how, not that every row arrived."
    }
  },
  {
    "id": "automation",
    "text": "Automated a task people did by hand",
    "answer": "counts",
    "why": {
      "charts": "A timing sheet shows minutes before and after.",
      "code": "The script alone does not show time saved."
    }
  },
  {
    "id": "uptime",
    "text": "Kept a service running",
    "answer": "charts",
    "why": {
      "code": "Uptime shows on the service dashboard.",
      "counts": "User counts do not show uptime."
    }
  },
  {
    "id": "users",
    "text": "Handled more users",
    "answer": "counts",
    "why": {
      "charts": "User counts come from the database or analytics.",
      "code": "Code does not show how many users came."
    }
  },
  {
    "id": "bill",
    "text": "Cut a cloud bill",
    "answer": "charts",
    "why": {
      "code": "The bill or cost report shows the cut.",
      "counts": "Use the bill, for one stated period."
    }
  }
];

export const careerM3MatchWorkToProof: CustomCanvasSpec = {
  kind: "custom",
  title: "Match the work to its proof",
  purpose: "Sort eight kinds of work into the kind of proof each one leaves: charts and plans, code and settings, or counts and sheets, with a short reason after each wrong try.",
  limits: "Real work often leaves more than one trace. Each card shows the trace this course asks you to keep first. Cost and uptime figures need a stated period and source.",
  component: makeSorterCanvas({
    buckets: PROOF_BUCKETS,
    cards: PROOF_CARDS,
    deckLabel: "Kind of work",
    prompt: "What would prove this work?",
    hint: "Tap the kind of proof, or drag the card onto it.",
    endNote: "Different work leaves different traces. For a security fix, show the fix and never the secret.",
  }),
};
