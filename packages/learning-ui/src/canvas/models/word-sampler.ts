// Word sampler as a pure model: a sentence with a blank, and the words a
// language model might put there, each with an illustrative weight. Asking
// once draws one word in proportion to its weight; asking many times shows
// that the most common word wins most of the time. A second context
// (for example the same question with the learner's facts added) has
// different weights, so a different word rises. Seeded, so a learner, a
// mentor and a test see the same draws. Weights are illustrative, not
// measured from any real model. No React here.

export type WordChoice = {
  /** The word or short phrase, at most about 14 characters ("Redis"). */
  word: string;
  /** Relative weight, a positive number; weights need not sum to 100. */
  weight: number;
};

export type SamplerContext = {
  id: string;
  /** Tab label, at most about 16 characters ("No context"). */
  label: string;
  /** The sentence with ___ for the blank, at most about 60 characters. */
  prompt: string;
  /** Two to six words. */
  words: WordChoice[];
};

export type WordSamplerConfig = {
  /** One to three contexts. */
  contexts: SamplerContext[];
  /** How many draws "Ask many times" makes, 10 to 50. */
  manyCount: number;
  /** The one line under the picture telling the learner what to do. */
  hint: string;
  /** Seed for the draws; any non-zero integer. */
  seed: number;
};

export type SamplerState = {
  /** Draws so far for each context id: word to count. */
  tally: Record<string, Record<string, number>>;
  /** The last word drawn per context id, or null. */
  last: Record<string, string | null>;
  /** The random state, advanced on every draw. */
  rng: number;
};

const BLANK = "___";

function zeroTally(context: SamplerContext): Record<string, number> {
  return Object.fromEntries(context.words.map((w) => [w.word, 0]));
}

export function startSampler(config: WordSamplerConfig): SamplerState {
  return {
    tally: Object.fromEntries(config.contexts.map((c) => [c.id, zeroTally(c)])),
    last: Object.fromEntries(config.contexts.map((c) => [c.id, null])),
    rng: config.seed >>> 0,
  };
}

/** One step of mulberry32 (the generator behind `dealOrder`): the next state and a number in [0, 1). */
function nextRandom(state: number): { rng: number; value: number } {
  const rng = (state + 0x6d2b79f5) >>> 0;
  let t = rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { rng, value: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}

/** Weights that count: a word with a missing, negative or non-finite weight gets none. */
const weightOf = (w: WordChoice) => (Number.isFinite(w.weight) && w.weight > 0 ? w.weight : 0);

/** Share of each word in a context, from its weights (0 to 1, summing to 1). */
export function shares(context: SamplerContext): Record<string, number> {
  const total = context.words.reduce((n, w) => n + weightOf(w), 0);
  const out: Record<string, number> = {};
  for (const w of context.words) {
    out[w.word] = (out[w.word] ?? 0) + (total > 0 ? weightOf(w) / total : 1 / context.words.length);
  }
  return out;
}

/** Draw `n` words for one context, in proportion to their weights. */
export function draw(state: SamplerState, config: WordSamplerConfig, contextId: string, n: number): SamplerState {
  const context = config.contexts.find((c) => c.id === contextId);
  const count = Math.floor(n);
  if (!context || context.words.length === 0 || !(count > 0)) return state;
  const total = context.words.reduce((sum, w) => sum + weightOf(w), 0);
  const tally = { ...zeroTally(context), ...state.tally[contextId] };
  let rng = state.rng;
  let last: string | null = state.last[contextId] ?? null;
  for (let i = 0; i < count; i++) {
    const r = nextRandom(rng);
    rng = r.rng;
    let pick = context.words[context.words.length - 1].word;
    if (total > 0) {
      let at = r.value * total;
      for (const w of context.words) {
        at -= weightOf(w);
        if (at < 0) {
          pick = w.word;
          break;
        }
      }
    } else {
      pick = context.words[Math.floor(r.value * context.words.length)].word;
    }
    tally[pick] = (tally[pick] ?? 0) + 1;
    last = pick;
  }
  return { tally: { ...state.tally, [contextId]: tally }, last: { ...state.last, [contextId]: last }, rng };
}

/** Total draws so far in one context. */
export function totalDraws(state: SamplerState, contextId: string): number {
  return Object.values(state.tally[contextId] ?? {}).reduce((a, b) => a + b, 0);
}

/** The most drawn word in a context (ties go to the earlier word in the list), or null before any draw. */
export function topDrawn(state: SamplerState, context: SamplerContext): { word: string; count: number; total: number } | null {
  const total = totalDraws(state, context.id);
  if (total === 0) return null;
  let best = context.words[0].word;
  for (const w of context.words) if ((state.tally[context.id]?.[w.word] ?? 0) > (state.tally[context.id]?.[best] ?? 0)) best = w.word;
  return { word: best, count: state.tally[context.id]?.[best] ?? 0, total };
}

/** Clear the tally for one context. */
export function resetContext(state: SamplerState, contextId: string): SamplerState {
  if (!(contextId in state.tally)) return state;
  const cleared = Object.fromEntries(Object.keys(state.tally[contextId]).map((w) => [w, 0]));
  return { ...state, tally: { ...state.tally, [contextId]: cleared }, last: { ...state.last, [contextId]: null } };
}

/** Problems with the data: no blank in a prompt, non-positive weights, duplicate words, counts out of range. Empty when fine. */
export function checkWordSampler(config: WordSamplerConfig): string[] {
  const problems: string[] = [];
  if (config.contexts.length < 1 || config.contexts.length > 3) problems.push(`${config.contexts.length} contexts, need 1 to 3`);
  if (!Number.isInteger(config.manyCount) || config.manyCount < 10 || config.manyCount > 50) problems.push(`manyCount ${config.manyCount}, need a whole number from 10 to 50`);
  if (!Number.isInteger(config.seed) || config.seed === 0) problems.push(`seed ${config.seed}, need a non-zero integer`);
  const ids = new Set<string>();
  for (const c of config.contexts) {
    if (ids.has(c.id)) problems.push(`context ${c.id}: duplicate id`);
    ids.add(c.id);
    if (!c.prompt.includes(BLANK)) problems.push(`context ${c.id}: prompt has no ${BLANK} blank`);
    if (c.words.length < 2 || c.words.length > 6) problems.push(`context ${c.id}: ${c.words.length} words, need 2 to 6`);
    const seen = new Set<string>();
    for (const w of c.words) {
      if (!w.word.trim()) problems.push(`context ${c.id}: empty word`);
      if (seen.has(w.word)) problems.push(`context ${c.id}: duplicate word ${w.word}`);
      seen.add(w.word);
      if (!Number.isFinite(w.weight) || w.weight <= 0) problems.push(`context ${c.id}: weight of ${w.word} is ${w.weight}, need more than 0`);
    }
  }
  return problems;
}
