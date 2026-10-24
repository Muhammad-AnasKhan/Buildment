import type { CustomCanvasSpec } from "../registry";
import { ScatterPlayCanvas } from "./ScatterPlayCanvas";

// 9.6 beat 4: a search that must ask every shard is slow whenever any shard
// is slow, so slow searches climb with the shard count (1 - 0.99^n). A global
// index asks one shard, at the cost of two writes per order. Builds on the
// fan-out model of chapter 2.4. Model: ./model.ts and ../models/fan-out.ts.
export const sysdesignM9ScatterPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the shard count: the tail grows",
  purpose: "Drag the shard count and flip between a local and a global index: a search that asks every shard is slow whenever any shard is slow, while a global index asks one shard but writes every order twice.",
  limits:
    "Assumes each shard is slow 1 time in 100, independently of the others, as in the example in Dean and Barroso's The Tail at Scale (100 servers give 63%). Real slow moments are often linked. The times are made-up story numbers (5 ms fast, 200 ms slow), and the replies are slowed down so you can watch them. The searches come from a fixed random sequence, so the tally wanders around the true chance. A real global index is also updated a little after the data, so it can lag.",
  component: ScatterPlayCanvas,
};
