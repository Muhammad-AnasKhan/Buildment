import type { CustomCanvasSpec } from "../registry";
import type { WordSamplerConfig } from "../models/word-sampler";
import { makeWordSamplerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 6.2: a model picks likely words, so the common answer
// comes out most often, and your facts change the odds. The weights are made
// up for teaching (dossier B1, B6, B11); they are not measured from any
// assistant, and the picture says so.
export const LIKELY_NEXT_WORD: WordSamplerConfig = {
  contexts: [
    {
      id: "plain",
      label: "No context",
      prompt: "A good cache for my project is ___",
      words: [
        { word: "Redis", weight: 60 },
        { word: "Memcached", weight: 18 },
        { word: "Valkey", weight: 12 },
        { word: "KeyDB", weight: 6 },
        { word: "Dragonfly", weight: 4 },
      ],
    },
    {
      id: "facts",
      label: "With my facts",
      prompt: "We sell hosted caching and need a BSD licence, so use ___",
      words: [
        { word: "Valkey", weight: 52 },
        { word: "Redis", weight: 24 },
        { word: "Memcached", weight: 14 },
        { word: "KeyDB", weight: 6 },
        { word: "Dragonfly", weight: 4 },
      ],
    },
  ],
  manyCount: 20,
  hint: "Ask 20 times, then switch the tab and ask 20 times again.",
  seed: 4127,
};

export const likelyNextWord: CustomCanvasSpec = {
  kind: "custom",
  title: "Likely words come out most often",
  purpose: "Ask a made-up assistant the same question once, then many times, and see that the common word comes out most often; then add your facts and see the odds move.",
  limits:
    "The weights are made up to show the idea. They are not measured from any real assistant. A real assistant weighs far more than one sentence, and answers differ between tools and between days. Even with your facts, the common word can still come out, so check the answer on the project's own page.",
  component: makeWordSamplerCanvas(LIKELY_NEXT_WORD),
};
