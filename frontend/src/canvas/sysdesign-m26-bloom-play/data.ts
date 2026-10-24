import type { CustomCanvasSpec } from "../registry";
import { BloomPlayCanvas } from "./BloomPlayCanvas";

// 26.4 beat 2: the seen set as a Bloom filter. Model: models/crawl-bloom.ts,
// which reuses hashCount and withCommas from models/bloom.ts (chapter 7.3).
export const sysdesignM26BloomPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the error, watch the memory",
  purpose: "Change the number of URLs known and the error rate of a Bloom filter and watch the bits per URL, the hash functions and the memory change, next to the memory for exact 8 byte fingerprints and for the URL strings themselves.",
  limits:
    "The sizes come from the standard Bloom filter formulas [S113] for the best number of hash functions, counted in decimal gigabytes. The picture leaves out the second copy kept for safety, a filter that fills past its planned size (its error then grows), growing the filter, the time to check bits in memory and the choice to use exact fingerprints on disk. The bars are on one linear scale, so the Bloom bar is thin on purpose; the numbers beside the bars are exact. The error is the share of new URLs wrongly seen as old, which DalilBot then skips.",
  component: BloomPlayCanvas,
};
