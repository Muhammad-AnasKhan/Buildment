import type { CustomCanvasSpec } from "../registry";
import type { FlipDeckConfig } from "../models/flip-deck";
import { makeFlipDeckCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 1.3: six claims people say about AI and jobs, each
// flipped to show what the data says and where it comes from. Dossier part A:
// A7 (Gallup), A21 (Stanford), A29 and A30 (BLS), A31 (Indeed), A34 (support
// agents), A38 and A39 (METR). All figures are US data unless a card says
// otherwise. Checked 2026-10-25.

export const FEAR_VERSUS_DATA: FlipDeckConfig = {
  verdicts: [
    { id: "supports", label: "Data supports it" },
    { id: "partly", label: "Partly" },
    { id: "not", label: "Data does not" },
  ],
  deckLabel: "Claim you may hear",
  prompt: "Pick a verdict, then flip the card",
  hint: "Choose what you think the data says. A wrong guess is fine: the card shows the evidence and its source.",
  endNote: "Some fears have evidence, some do not, and some depend on the task or the date. Check each one.",
  cards: [
    {
      id: "laid-off",
      front: "Most workers who lost their jobs lost them because of AI.",
      answer: "not",
      back: "In a 2026 Gallup survey of US workers, only 1% of those laid off named AI or automation as the main reason. Workers may not know the reason.",
      source: "Gallup, US survey, June 2026",
    },
    {
      id: "young-hiring",
      front: "In US data, hiring of young workers in AI-exposed jobs has fallen.",
      answer: "supports",
      back: "Payroll data to June 2026: employment of ages 22 to 25 in exposed jobs is 19% below trend. The authors call it descriptive, not proof of cause.",
      source: "Stanford Digital Economy Lab, Aug 2026",
    },
    {
      id: "developer-jobs",
      front: "Software developer jobs are shrinking.",
      answer: "partly",
      back: "In US data: BLS projects 10% more developer, QA and tester jobs by 2035 but 7% fewer programmer jobs. Indeed postings sit about 21% below Feb 2020.",
      source: "BLS, Aug 2026; Indeed, Oct 2026",
    },
    {
      id: "replace-all",
      front: "AI will soon replace all software developers.",
      answer: "not",
      back: "That is a prediction. Current US data does not show it: BLS projects growth to 2035 and Stanford finds no widespread displacement.",
      source: "BLS, Aug 2026; Stanford, Aug 2026",
    },
    {
      id: "slower-19",
      front: "Experienced developers work 19% slower with AI.",
      answer: "partly",
      back: "One 2025 trial of 16 developers found 19% longer. Its authors call it out of date, and their newer data is too weak to give a number.",
      source: "METR, July 2025 and Feb 2026",
    },
    {
      id: "beginners-faster",
      front: "On tasks that suit AI, beginners often finish faster.",
      answer: "supports",
      back: "In a study of 5,179 support agents, new agents gained about 34% and experienced agents very little. It was one company, on tasks that suit AI.",
      source: "Brynjolfsson, Li, Raymond; QJE 2025",
    },
  ],
};

export const fearVersusData: CustomCanvasSpec = {
  kind: "custom",
  title: "Fear versus data",
  purpose: "Guess whether the data supports, partly supports or does not support six claims about AI and jobs, then flip each card to see the evidence and its source.",
  limits:
    "A verdict is a coarse label for a messier truth. Most of this data is from the US, some of it is a single study, and figures change as new data arrives. No source here predicts one person's future.",
  component: makeFlipDeckCanvas(FEAR_VERSUS_DATA),
};
