import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 1.2: sort eight real claims about AI by what kind of
// claim they are. Every card is a claim the dossier (part A) states with its
// date: A10, A11, A12, A13, A21, A29, A52, A61.

export const CLAIM_TYPE_BUCKETS: SortBucket[] = [
  { id: "prediction", label: "Prediction", sub: "about the future" },
  { id: "company", label: "Company claim", sub: "the seller's own report" },
  { id: "independent", label: "Independent", sub: "measured by outsiders" },
];

export const CLAIM_TYPE_CARDS: SortCard[] = [
  {
    id: "ninety-percent",
    text: "In March 2025 an AI company's CEO said AI would write 90 percent of code within months.",
    answer: "prediction",
    why: {
      company: "He spoke about months ahead. No result had been reported yet.",
      independent: "Nobody outside the company measured anything. It looks ahead.",
    },
  },
  {
    id: "devin-launch",
    text: "At launch, Devin's maker reported that Devin solved 13.86% of the issues in a test it ran.",
    answer: "company",
    why: {
      prediction: "It reports a test that was already run, not a forecast.",
      independent: "The seller chose and ran the test, so it is not independent.",
    },
  },
  {
    id: "devin-outside",
    text: "In 2025 a team outside the maker tried Devin on 20 real tasks: 3 worked, 14 failed, 3 were unclear.",
    answer: "independent",
    why: {
      prediction: "It reports what already happened on real tasks.",
      company: "A different team ran it, not Devin's maker. Its limit is 20 tasks.",
    },
  },
  {
    id: "google-quarter",
    text: "Google's CEO said in 2024 that over a quarter of new code at Google is made by AI, then reviewed.",
    answer: "company",
    why: {
      prediction: "It describes the present, not the future.",
      independent: "Google reported on itself. No outside group counted the code.",
    },
  },
  {
    id: "stanford-payroll",
    text: "A 2026 study of US payroll records found fewer young workers hired in AI-exposed jobs.",
    answer: "independent",
    why: {
      prediction: "It counts what already happened in payroll records.",
      company: "University researchers ran it. No AI company reported it.",
    },
  },
  {
    id: "veracode",
    text: "A security firm tested over 100 AI models and said 45% of code samples failed its security tests.",
    answer: "company",
    why: {
      prediction: "The tests were already run. It reports results.",
      independent: "The firm sells security tools and ran the tests. It is vendor research.",
    },
  },
  {
    id: "bls-projection",
    text: "The US labour department projects that software developer jobs will grow 10% from 2025 to 2035.",
    answer: "prediction",
    why: {
      company: "It is a government projection, not a company reporting on itself.",
      independent: "It looks official, but it is about 2035. A projection is a prediction.",
    },
  },
  {
    id: "gartner-forecast",
    text: "In 2025 an analyst firm forecast that by 2027 half the firms planning big service cuts would drop them.",
    answer: "prediction",
    why: {
      company: "It does not report the firm's own results. It looks ahead to 2027.",
      independent: "It rests on a poll, but a forecast is not a count of what happened.",
    },
  },
];

export const claimTypeSorter: CustomCanvasSpec = {
  kind: "custom",
  title: "Sort claims by kind",
  purpose: "Sort eight real claims about AI into prediction, company claim and independent measurement, with a short reason after each wrong try.",
  limits:
    "Real claims mix kinds. A company can report a measurement, and an independent study can be paid for by a company. The buckets are a first question to ask, not a verdict on whether a claim is true.",
  component: makeSorterCanvas({
    buckets: CLAIM_TYPE_BUCKETS,
    cards: CLAIM_TYPE_CARDS,
    deckLabel: "Claim about AI",
    prompt: "What kind of claim is this?",
    hint: "Tap the bucket this claim belongs in, or drag the card onto it.",
    endNote: "Ask what kind of claim it is first. A projection is a prediction, even from a government.",
  }),
};
