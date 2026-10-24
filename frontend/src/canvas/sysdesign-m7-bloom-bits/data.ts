import type { CustomCanvasSpec } from "../registry";
import { BloomBitsCanvas } from "./BloomBitsCanvas";

// 7.3 "Drag the bits per key": false positive rate of a Bloom filter, with k
// about b x ln 2 hash functions [S113]. Model: models/bloom.ts.
export const sysdesignM7BloomBits: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the bits per key",
  purpose: "Drag the bits per key of a Bloom filter and watch how many lookups for absent keys wrongly say maybe, the curve of that rate, and the memory for a billion keys.",
  limits: "Whole-key Bloom filters help point lookups only, not range scans. Real filters add some overhead, so the memory is a floor.",
  component: BloomBitsCanvas,
};
