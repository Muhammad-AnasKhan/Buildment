export type RankedChunk = { id: string; gist: string; relevant: boolean };

// One query's ranked results: 10 chunks, 4 of them relevant (ranks 2, 3, 6
// and 9). Every relevant chunk is somewhere in the list, so recall reaches 1
// at k = 9.
export const RANKED_CHUNKS: RankedChunk[] = [
  { id: "annual-summary#2", gist: "Our year in numbers", relevant: false },
  { id: "march-report#1", gist: "Food parcels in March", relevant: true },
  { id: "march-table#0", gist: "Table: parcels by district", relevant: true },
  { id: "february-report#1", gist: "Food parcels in February", relevant: false },
  { id: "donors#3", gist: "Thank you to our donors", relevant: false },
  { id: "march-report#4", gist: "Late deliveries in March", relevant: true },
  { id: "water-project#0", gist: "Water project update", relevant: false },
  { id: "staff#1", gist: "New field staff", relevant: false },
  { id: "north-district#2", gist: "North district, March notes", relevant: true },
  { id: "procurement#5", gist: "Procurement policy", relevant: false },
];

export const K_BOUNDS = { min: 1, max: RANKED_CHUNKS.length, default: 3 } as const;

export type MetricsAtK = {
  k: number;
  hits: number;
  totalRelevant: number;
  recall: number;
  precision: number;
  /** 1 / rank of the first relevant chunk within the top k, or 0 if there is none. */
  reciprocalRank: number;
  firstRelevantRank: number | null;
};

export function clampK(value: number): number {
  if (!Number.isFinite(value)) return K_BOUNDS.default;
  return Math.max(K_BOUNDS.min, Math.min(K_BOUNDS.max, Math.round(value)));
}

export function metricsAtK(rawK: number, chunks: RankedChunk[] = RANKED_CHUNKS): MetricsAtK {
  const k = Math.min(clampK(rawK), chunks.length);
  const top = chunks.slice(0, k);
  const hits = top.filter((chunk) => chunk.relevant).length;
  const totalRelevant = chunks.filter((chunk) => chunk.relevant).length;
  const firstIndex = top.findIndex((chunk) => chunk.relevant);
  const firstRelevantRank = firstIndex === -1 ? null : firstIndex + 1;
  return {
    k,
    hits,
    totalRelevant,
    recall: totalRelevant === 0 ? 0 : hits / totalRelevant,
    precision: k === 0 ? 0 : hits / k,
    reciprocalRank: firstRelevantRank === null ? 0 : 1 / firstRelevantRank,
    firstRelevantRank,
  };
}

/** Two decimals, as the chapter writes them. */
export function formatMetric(value: number): string {
  return value.toFixed(2);
}

/** The live "What changed" sentence: the delta in words, not only new numbers. */
export function describeChange(before: MetricsAtK | null, after: MetricsAtK): string {
  if (before === null || before.k === after.k) {
    return `With k = ${after.k}, ${after.hits} of the ${after.k} kept chunks are relevant.`;
  }
  const grew = after.k > before.k;
  const newHits = after.hits - before.hits;
  if (grew && newHits === 0) {
    return `Raising k to ${after.k} added only chunks that are not relevant, so recall stayed at ${formatMetric(after.recall)} and precision fell to ${formatMetric(after.precision)}.`;
  }
  if (grew) {
    return `Raising k to ${after.k} found ${newHits} more relevant ${newHits === 1 ? "chunk" : "chunks"}, so recall rose to ${formatMetric(after.recall)}. Precision is now ${formatMetric(after.precision)}.`;
  }
  if (newHits === 0) {
    return `Lowering k to ${after.k} dropped only chunks that are not relevant, so recall stayed at ${formatMetric(after.recall)} and precision rose to ${formatMetric(after.precision)}.`;
  }
  return `Lowering k to ${after.k} dropped ${-newHits} relevant ${newHits === -1 ? "chunk" : "chunks"}, so recall fell to ${formatMetric(after.recall)}. Precision is now ${formatMetric(after.precision)}.`;
}
