import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 23.1 beat 2: Dalil's search estimate drawn as three chains.
// Model: models/search-estimate.ts. Method: chapter 2.3.
export const sysdesignM23EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the shoppers, find the load",
  purpose: "Change the shoppers a day, the searches for each shopper, the suggestion calls for each search or the products, and watch three chains update: search load, suggestion load and index size with its shards. Rings mark the numbers that shape the design.",
  limits:
    "Dalil is made up and every input is a course assumption: averages and guesses. One peak factor (3) is used for both kinds of traffic, each product has 100 different words, one entry takes 4 bytes and one shard holds 10 GB. Real apps wait until a shopper pauses before asking for suggestions, so the call count is lower. The index size leaves out compression, copies for safety and the text itself. The marks of 10,000 calls a second and 4 shards are rules of thumb for this picture, not limits of any real machine.",
  component: EstimatePlayCanvas,
};
