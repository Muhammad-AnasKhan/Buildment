import type { CustomCanvasSpec } from "../registry";
import type { FlipDeckConfig } from "../models/flip-deck";
import { makeFlipDeckCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 10.5: eight claims about AI detectors and authorship.
// The learner picks a verdict first (data supports it, partly, data does not),
// then the card flips to what the evidence says and where it comes from.
// Sources: OpenAI's classifier notice and its July 2023 update (C68), Liang et
// al. 2023 on non-native English writers (C69), Wikipedia's "Signs of AI
// writing" advice page (C70), Medium's AI content policy (C71). The card on
// dated drafts is course advice, not a study, and says so on its source line.

export const DETECTOR_MYTHS: FlipDeckConfig = {
  verdicts: [
    { id: "supports", label: "Data supports it" },
    { id: "partly", label: "Partly" },
    { id: "not", label: "Data does not" },
  ],
  cards: [
    {
      id: "openai-withdrew",
      front: "OpenAI shut down its own AI text detector because it was not accurate enough.",
      answer: "supports",
      back: "OpenAI withdrew its classifier on 20 July 2023 for low accuracy. At launch it labelled only 26% of AI-written text correctly.",
      source: "OpenAI classifier notice, July 2023",
    },
    {
      id: "wrong-flag",
      front: "A detector can wrongly call a person's own writing AI-made.",
      answer: "supports",
      back: "At launch, OpenAI's classifier wrongly labelled human text as AI 9% of the time. A 2023 study found far higher rates for some writers.",
      source: "OpenAI 2023; Liang et al., Patterns 2023",
    },
    {
      id: "second-language",
      front: "Detectors judge writers of English as a second language fairly.",
      answer: "not",
      back: "In a 2023 pilot study, seven detectors called 61% of 91 real essays by non-native writers AI-made, on average. US eighth-grade essays were judged almost perfectly.",
      source: "Liang et al., Patterns, 2023",
    },
    {
      id: "score-is-proof",
      front: "A detector's score is proof that a text was written by AI.",
      answer: "not",
      back: "Detectors guess. OpenAI withdrew its own for low accuracy, and a 2023 study found real writers flagged as AI. A guess cannot prove anything.",
      source: "OpenAI 2023; Liang et al., 2023",
    },
    {
      id: "short-posts",
      front: "A short post of 150 words is easy for a detector to judge.",
      answer: "not",
      back: "OpenAI said its classifier was unreliable on texts under 1,000 characters and advised it only for English. A 150-word post is usually shorter than that.",
      source: "OpenAI classifier notice, 2023",
    },
    {
      id: "signs-list",
      front: "Wikipedia's list of AI-writing signs can help you edit your own draft.",
      answer: "partly",
      back: "Its editors list signs such as vague sources and invented citations. They say these are signs, not proof, so use the list on yourself, not to accuse.",
      source: "Wikipedia, Signs of AI writing (advice)",
    },
    {
      id: "dated-drafts",
      front: "Dated drafts and notes show that a post is yours.",
      answer: "partly",
      back: "No tool proves who wrote a text. Dated drafts, notes and commits are evidence a reader can check. They support your word but do not prove it.",
      source: "Course advice, not a study",
    },
    {
      id: "medium-label",
      front: "Medium needs a label for any AI help, even a grammar check.",
      answer: "not",
      back: "Medium says grammar or outline help need not be disclosed, but text that AI generated must be. Undisclosed AI text gets Network Only reach.",
      source: "Medium Help Center, checked 2026-10-25",
    },
  ],
  deckLabel: "Claim about detectors",
  prompt: "Pick a verdict, then flip the card",
  hint: "Choose what you think the evidence says, then read the source.",
  endNote: "Detectors give a guess, not proof. Drafts, notes and checked facts are the evidence of who wrote it.",
};

export const detectorMyths: CustomCanvasSpec = {
  kind: "custom",
  title: "What the evidence says about AI detectors",
  purpose: "Pick a verdict for eight claims about AI detectors and authorship, then flip each card to see the evidence and its source.",
  limits:
    "A verdict is a coarse label for a messier truth. The detector studies are small, mostly used older detectors and are from 2023, so newer tools may differ. The dated-drafts card is the course's advice, not a study. Medium's rules were checked on 2026-10-25 and can change.",
  component: makeFlipDeckCanvas(DETECTOR_MYTHS),
};
