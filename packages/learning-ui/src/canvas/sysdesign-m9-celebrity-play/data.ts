import type { CustomCanvasSpec } from "../registry";
import { CelebrityPlayCanvas } from "./CelebrityPlayCanvas";

// 9.4 beat 2: more shards do not cool the shard that holds Noor's key; splitting
// the key into sub-keys does, but the sub-keys land by hash, so luck matters.
// Model: ./model.ts.
export const sysdesignM9CelebrityPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "More shards do not help; splitting does",
  purpose: "Drag the shard count and split one hot key into sub-keys, and watch which shard is the hottest: extra shards cool every shard except the one holding the hot key, and sub-keys land by hash, so the result depends on luck.",
  limits:
    "The figures are the course's own simulation with Suq's made-up load: 1,200 writes a second spread evenly over many keys, 1,800 a second on seller:noor-crafts, a limit of 1,000 writes a second on each shard, and a shard chosen by hash(key) mod shards with the hash from chapter 9.7. Real traffic changes through the day, and a real store may let you choose each sub-key's shard.",
  component: CelebrityPlayCanvas,
};
