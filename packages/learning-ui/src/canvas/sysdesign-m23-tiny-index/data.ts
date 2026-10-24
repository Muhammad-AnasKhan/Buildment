import type { CustomCanvasSpec } from "../registry";
import { TinyIndexCanvas } from "./TinyIndexCanvas";

// 23.2 beat 2: build an index from three documents, then ask it.
// Model: models/tiny-index.ts (the tokenizer and index of the chapter code).
export const sysdesignM23TinyIndex: CustomCanvasSpec = {
  kind: "custom",
  title: "Build an index from three documents",
  purpose: "Step through three products: split them into words, flip the table so each word lists its products, then tap words to ask a question and see which products hold every word and how each one scores.",
  limits:
    "Three tiny products, made up. Every word appears once in each product, so only how rare a word is changes the score; real engines also use how often a word repeats and how long the text is. Real engines store the lists compressed and keep the word table in memory. The weight ln(3 / products that contain the word) is the simple form from chapter 23.2, not a real engine's formula.",
  component: TinyIndexCanvas,
};
