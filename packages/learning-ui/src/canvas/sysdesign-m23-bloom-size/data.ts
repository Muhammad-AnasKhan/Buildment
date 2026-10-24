import type { CustomCanvasSpec } from "../registry";
import { BloomSizeCanvas } from "./BloomSizeCanvas";

// 23.4 beat 2: drag the bits per word and the hashes of a Bloom filter.
// Model: models/bloom-hashes.ts (adds the hash count to models/bloom.ts); formula [S113].
export const sysdesignM23BloomSize: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the bits and the hashes",
  purpose: "Drag the bits per word and the number of hashes of a Bloom filter and watch how full the row of bits gets, the wrong-maybe rate for every hash count with the best count ringed, the memory for 100 million words, and how many of 100 typos slip through.",
  limits:
    "The formula assumes independent hashes and a filter filled with exactly the planned number of words. Real filters add some overhead, so the memory is a floor. A Bloom filter cannot remove a word, and it says nothing about the words themselves: only maybe or no. The rate is drawn on a log scale so that small rates stay visible.",
  component: BloomSizeCanvas,
};
