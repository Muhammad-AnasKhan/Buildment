import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// AI Engineering Interview course, chapter 3.3 "Chunking strategies". Najm's
// 900-word credit policy section cut into fixed-size word chunks with
// overlap. Chunk count and stored words are exact for that section; the
// share of facts cut assumes a fact can start at any word, as in a long
// document cut the same way. See spec.md.

export const SECTION_WORDS = 900;
/** Overlap is capped this many words below the chunk size, so chunks always move forward. */
export const MIN_STRIDE = 50;

export type Chunking = {
  size: number;
  /** The overlap the learner asked for. */
  requestedOverlap: number;
  /** The overlap actually used: at most size minus 50. */
  overlap: number;
  capped: boolean;
  /** Words between the starts of two chunks. */
  stride: number;
  factWords: number;
  chunks: number;
  storedWords: number;
  /** Stored words divided by section words, minus 1. */
  extra: number;
  /** Share of start positions where a fact of factWords words crosses a cut and is in no chunk whole, 0 to 1. */
  cutShare: number;
};

function num(value: unknown, fallback: number, min: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.round(value)) : fallback;
}

/** Chunk lengths for a text of `words` words: starts at 0, then every `stride` words until a chunk reaches the end. */
export function chunkLengths(words: number, size: number, stride: number): number[] {
  const lengths: number[] = [];
  for (let start = 0; start < words; start += stride) {
    lengths.push(Math.min(size, words - start));
    if (start + size >= words) break;
  }
  return lengths;
}

/**
 * A fact of L words starting r words after a chunk start sits whole in that
 * chunk when r + L <= size. Starts repeat every stride words, so the share of
 * positions that are cut is (L - 1 - overlap) / stride, between 0 and 1.
 */
export function cutShare(factWords: number, overlap: number, stride: number): number {
  return Math.max(0, Math.min(1, (factWords - 1 - overlap) / stride));
}

export function chunking(values: SliderValues): Chunking {
  const size = num(values.size, 300, MIN_STRIDE * 2);
  const requestedOverlap = num(values.overlap, 50, 0);
  const overlap = Math.min(requestedOverlap, size - MIN_STRIDE);
  const stride = size - overlap;
  const factWords = num(values.fact, 40, 1);
  const lengths = chunkLengths(SECTION_WORDS, size, stride);
  const storedWords = lengths.reduce((sum, n) => sum + n, 0);
  return {
    size,
    requestedOverlap,
    overlap,
    capped: overlap < requestedOverlap,
    stride,
    factWords,
    chunks: lengths.length,
    storedWords,
    extra: storedWords / SECTION_WORDS - 1,
    cutShare: cutShare(factWords, overlap, stride),
  };
}

const words = (n: number) => n.toLocaleString("en-US");
export const pct = (share: number) => `${Math.round(share * 100)}%`;

/** "a" or "an" before a number read aloud: an 8-, 11-, 18- or 80-word fact, but a 110-word one. */
export function article(n: number): string {
  const text = String(n);
  return text.startsWith("8") || ((text.length === 2 || text.length === 5) && /^1[18]/.test(text)) ? "an" : "a";
}

/** Why the fact is or is not safe, in one clause. */
function reason(c: Chunking): string {
  const fact = `${article(c.factWords)} ${c.factWords}-word fact`;
  if (c.factWords > c.size) return `${fact} is longer than a ${c.size}-word chunk, so it can never sit whole in one`;
  if (c.cutShare === 0) return `${fact} is no longer than the ${c.overlap}-word overlap, so it always sits whole in one chunk`;
  return `${fact} is longer than the ${c.overlap}-word overlap, so ${pct(c.cutShare)} of the places it could start still cross a cut`;
}

function computeChunking(values: SliderValues): SliderResult {
  const c = chunking(values);
  return {
    stats: [
      { label: "Chunks", value: words(c.chunks), detail: `for the ${words(SECTION_WORDS)}-word section` },
      { label: "Extra text stored", value: `+${pct(c.extra)}`, detail: `${words(c.storedWords)} words stored` },
      {
        label: "Facts cut at a boundary",
        value: pct(c.cutShare),
        detail: c.capped ? `${c.factWords}-word fact; overlap capped at ${c.overlap}` : `for ${article(c.factWords)} ${c.factWords}-word fact`,
      },
    ],
    bars: [
      { label: "Section text", value: SECTION_WORDS, display: `${words(SECTION_WORDS)} words` },
      { label: "Text stored in chunks", value: c.storedWords, display: `${words(c.storedWords)} words` },
    ],
    summary: `${c.size}-word chunks with ${c.overlap} words of overlap give ${c.chunks} chunks and store ${words(c.storedWords)} words, ${pct(c.extra)} more than the section. ${pct(c.cutShare)} of ${c.factWords}-word facts are cut at a boundary.`,
  };
}

export function describeChunkingChange(before: SliderValues, after: SliderValues): string {
  const a = chunking(before);
  const b = chunking(after);
  const parts: string[] = [];
  if (a.size !== b.size) parts.push(`the chunk size from ${a.size} to ${b.size} words`);
  if (a.requestedOverlap !== b.requestedOverlap) parts.push(`the overlap from ${a.requestedOverlap} to ${b.requestedOverlap} words`);
  if (a.factWords !== b.factWords) parts.push(`the fact length from ${a.factWords} to ${b.factWords} words`);
  if (parts.length === 0) return "Nothing changed: the same settings cut the section the same way.";
  const cap = b.capped ? ` The overlap used is capped at ${b.overlap} words, ${MIN_STRIDE} below the chunk size.` : "";
  return `You changed ${parts.join(" and ")}. Now ${b.chunks} chunks store ${words(b.storedWords)} words (+${pct(b.extra)}), and ${reason(b)}.${cap}`;
}

export const chunkSizeOverlap: SliderSpec = {
  kind: "slider",
  title: "Chunk size, overlap and the facts they cut",
  purpose: "Change the chunk size and overlap and see how many facts stay whole and how much extra text you store.",
  intro:
    "Section 4 of Najm's credit policy is 900 words long. The indexer cuts it into fixed chunks of words, and each chunk repeats the last words of the one before it (the overlap). A fact, such as a rule and its exception, is useful only if one chunk holds all of it. Huda starts with 300-word chunks, 50 words of overlap and a 40-word rule. Predict what happens to that rule if she drops the overlap.",
  inputs: [
    { id: "size", label: "Chunk size", min: 100, max: 600, step: 50, default: 300, unit: "words" },
    { id: "overlap", label: "Overlap", min: 0, max: 200, step: 10, default: 50, unit: "words" },
    { id: "fact", label: "Fact length", min: 10, max: 150, step: 10, default: 40, unit: "words" },
  ],
  compute: computeChunking,
  describeChange: describeChunkingChange,
  barsTitle: "Words in the index for the 900-word section",
  tryThis: [
    "Set the overlap to 0. A 40-word fact is now cut 13% of the time, and the stored text falls from 1,050 to 900 words.",
    "Put the overlap back to 50 and raise the fact length to 80 words. About 12% are cut again: overlap only protects facts no longer than the overlap.",
  ],
  limits:
    "Chunks are cut by word count only, with no sentence or heading boundaries. The share of facts cut assumes a fact can start at any word, as in a long document cut the same way. Overlap is capped 50 words below the chunk size. Retrieval quality, embedding limits and prompt cost are not modelled.",
};
