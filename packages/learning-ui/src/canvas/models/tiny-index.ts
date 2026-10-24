// 23.2 "Build an index from three documents". The tokenizer and the tiny index
// of the chapter, plus the word weights and the scores the picture shows.
// Pure functions, no React.
//
//   weight(word) = ln(3 / number of products that contain the word)
//   score(product) = sum of the weights of the chosen words it contains

export type Product = {
  id: number;
  text: string;
  /** The same text on two short lines, for a narrow card. */
  lines: [string, string];
};

export const PRODUCTS: readonly Product[] = [
  { id: 1, text: "Red running shoes", lines: ["Red running", "shoes"] },
  { id: 2, text: "Blue running shorts", lines: ["Blue running", "shorts"] },
  { id: 3, text: "Red waterproof hiking shoes", lines: ["Red waterproof", "hiking shoes"] },
];

/** The words the learner can tap in the last step, in the order of the chapter's table. */
export const QUERY_WORDS = ["blue", "hiking", "red", "running", "shoe", "short", "waterproof"] as const;
export type QueryWord = (typeof QUERY_WORDS)[number];

export const DEFAULT_QUERY: readonly QueryWord[] = ["red", "shoe"];

/** The tokenizer of chapter 23.2: lower case, split on non-letters and digits, strip a trailing s from words longer than 3 letters. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
}

/** A word as the picture shows it: the kept letters, and the stripped "s" when there was one. */
export type SplitWord = { word: string; stripped: boolean };

export function splitWords(text: string): SplitWord[] {
  const raw = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const kept = tokenize(text);
  return kept.map((word, i) => ({ word, stripped: raw[i] !== word }));
}

export type Index = {
  /** Words in alphabetical order. */
  terms: string[];
  /** Product numbers for each word, ascending. */
  postings: Record<string, number[]>;
  productCount: number;
};

export function buildIndex(products: readonly Product[] = PRODUCTS): Index {
  const postings: Record<string, number[]> = {};
  for (const p of products) {
    for (const term of tokenize(p.text)) {
      const list = (postings[term] ??= []);
      if (!list.includes(p.id)) list.push(p.id);
    }
  }
  for (const list of Object.values(postings)) list.sort((a, b) => a - b);
  return { terms: Object.keys(postings).sort(), postings, productCount: products.length };
}

export const INDEX = buildIndex();

/** Rarer words weigh more. */
export function weight(word: string, index: Index = INDEX): number {
  const n = index.postings[word]?.length ?? 0;
  return n > 0 ? Math.log(index.productCount / n) : 0;
}

export type Ranked = { id: number; score: number };

export type Answer = {
  /** Products in every chosen list. Empty when no word is chosen. */
  and: number[];
  /** Every product with its score, in product order. */
  scores: Ranked[];
  /** Products that match at least one word, best first; ties by product number. */
  ranked: Ranked[];
};

export function search(query: readonly string[], index: Index = INDEX): Answer {
  const words = [...new Set(query)].filter((w) => index.postings[w]);
  const ids = PRODUCTS.map((p) => p.id);
  const scores = ids.map((id) => ({ id, score: words.reduce((sum, w) => sum + (index.postings[w].includes(id) ? weight(w, index) : 0), 0) }));
  const and = words.length === 0 ? [] : ids.filter((id) => words.every((w) => index.postings[w].includes(id)));
  const ranked = scores
    .filter((s) => words.some((w) => index.postings[w].includes(s.id)))
    .sort((a, b) => b.score - a.score || a.id - b.id);
  return { and, scores, ranked };
}

export const STEP_TITLES = ["Products", "Words", "Flip", "Ask"] as const;

/** Captions of steps 1 to 3, each 38 characters or fewer. */
export const STEP_CAPTIONS = ["Three products, in plain text", "Words are cleaned and split", "Now each word lists its products"] as const;

export type Verdict = { text: string; tone: "good" | "warn" | "accent" };

/** The banner of step 4: 38 characters or fewer. */
export function askVerdict(query: readonly string[], index: Index = INDEX): Verdict {
  const words = [...new Set(query)];
  if (words.length === 0) return { text: "Tap words to ask a question", tone: "accent" };
  const { and } = search(words, index);
  if (and.length === 0) return { text: "No product has every word", tone: "warn" };
  if (and.length === 1) return { text: `Found: product ${and[0]} matches every word`, tone: "good" };
  return { text: `${and.length} products have every word`, tone: "good" };
}

export const verdictFor = (step: number, query: readonly string[]): Verdict =>
  step < 3 ? { text: STEP_CAPTIONS[step], tone: "accent" } : askVerdict(query);

/** Two decimals, as the picture and the screen reader say a score. */
export const scoreText = (n: number) => n.toFixed(2);

/** What a screen reader says for a word toggle: "waterproof, in 1 product, adds 1.10". */
export function wordLabel(word: string, index: Index = INDEX): string {
  const n = index.postings[word]?.length ?? 0;
  return `${word}, in ${n} ${n === 1 ? "product" : "products"}, adds ${scoreText(weight(word, index))}`;
}

/** The answer in words, for the live region. */
export function answerText(query: readonly string[], index: Index = INDEX): string {
  const words = [...new Set(query)];
  if (words.length === 0) return "No word chosen.";
  const a = search(words, index);
  const every = a.and.length === 0 ? "No product has every word." : `Products with every word: ${a.and.join(" and ")}.`;
  const ranked = a.ranked.length === 0 ? "No product matches." : `Ranked: ${a.ranked.map((r) => `product ${r.id}, ${scoreText(r.score)}`).join("; ")}.`;
  return `${words.join(", ")}. ${every} ${ranked}`;
}

/** Add the word, or remove it when it is already chosen. Keeps the order of the table. */
export function toggleWord(query: readonly QueryWord[], word: QueryWord): QueryWord[] {
  const next = query.includes(word) ? query.filter((w) => w !== word) : [...query, word];
  return QUERY_WORDS.filter((w) => next.includes(w));
}
