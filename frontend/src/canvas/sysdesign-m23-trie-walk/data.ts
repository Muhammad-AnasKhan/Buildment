import type { CustomCanvasSpec } from "../registry";
import { TrieWalkCanvas } from "./TrieWalkCanvas";

// 23.3 beat 3: type letters, walk down the trie, read the best three stored on the node.
// Model: models/trie-walk.ts (the trie of the chapter code).
export const sysdesignM23TrieWalk: CustomCanvasSpec = {
  kind: "custom",
  title: "Keep the best three at every node",
  purpose: "Tap letters to type. The picture walks down the trie one step for each letter, shows the three queries stored on the node it reaches, and counts the queries read below that node: none.",
  limits:
    "Nine made-up queries with frozen counts. The picture keeps the best 3 on each node so it fits a phone; Dalil shows up to 10. A real trie is rebuilt from fresh counts every few minutes, holds millions of queries and handles upper case, typos and accents. The keys cover only the letters of these queries, so a few queries cannot be typed to the end.",
  component: TrieWalkCanvas,
};
