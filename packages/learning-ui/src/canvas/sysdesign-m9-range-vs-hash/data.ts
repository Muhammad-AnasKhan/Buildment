import type { CustomCanvasSpec } from "../registry";
import { RangeVsHashCanvas } from "./RangeVsHashCanvas";

// 9.2 beat 3: Suq's orders over four shards. Range keeps a week on one or two
// shards but sends every new write to the newest quarter; hash spreads the
// writes but scatters the week over all four. Model: ./model.ts.
export const sysdesignM9RangeVsHash: CustomCanvasSpec = {
  kind: "custom",
  title: "Range or hash: where the week lives, where the writes go",
  purpose: "Slide a seven day window along the year and flip between range and hash partitioning: range keeps the week together but piles every new write on one shard, hash spreads the writes but scatters the week over every shard.",
  limits:
    "Suq's numbers are made up: 3,000 new writes a second, all dated today (24 October, day 297), a limit of 1,000 writes a second on each shard, and seven orders a day. Under range each shard holds a quarter of the year; under hash an order's shard comes from a fixed pseudo-random choice, so the dots always land in the same places. A real table has many more orders, and real range splits are not always even quarters.",
  component: RangeVsHashCanvas,
};
