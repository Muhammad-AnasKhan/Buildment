import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.4 beat 1: the seller Noor Crafts has a flash sale. The key seller:noor-crafts
// hashes to shard 4 (hash32 mod 4, see 9.7). Background load is 1,200 writes a
// second over many keys, so 300 on each shard. The sale adds 1,800 a second on
// the one key: shard 4 gets 300 + 1,800 = 2,100. The shard limit is 1,000.
export const sysdesignM9CelebrityKey: SceneSpec = {
  kind: "scene",
  title: "One popular seller, one overloaded shard",
  purpose: "Every order for Noor Crafts has the same key, so every one lands on shard 4. It gets 2,100 writes a second against a limit of 1,000. The other shards get 300.",
  limits: "Made-up story numbers: 1,200 writes a second spread over many keys, plus 1,800 a second for one seller during a sale; a limit of 1,000 writes a second per shard (the DynamoDB per-partition write limit, used as a round number). The key seller:noor-crafts hashes to shard 4 with the course's hash.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "app", label: "Suq app", kind: "server", sub: "3,000 writes/s", x: 60, y: 150 },
      { id: "s1", label: "Shard 1", kind: "database", sub: "limit 1,000/s", x: 210, y: 100 },
      { id: "s2", label: "Shard 2", kind: "database", sub: "limit 1,000/s", x: 360, y: 100 },
      { id: "s3", label: "Shard 3", kind: "database", sub: "limit 1,000/s", x: 210, y: 200 },
      { id: "s4", label: "Shard 4", kind: "database", sub: "limit 1,000/s", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "app", to: "s4", label: "Noor order" },
      { kind: "fly", at: 0.6, dur: 0.7, from: "app", to: "s4", label: "Noor order" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "app", to: "s4", label: "Noor order" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "app", to: "s1", label: "other" },
      { kind: "say", at: 2.0, actor: "s1", text: "300 writes/s", tone: "good" },
      { kind: "say", at: 2.0, actor: "s2", text: "300 writes/s", tone: "good" },
      { kind: "say", at: 2.0, actor: "s3", text: "300 writes/s", tone: "good" },
      { kind: "say", at: 2.5, actor: "s4", text: "2,100 writes/s", tone: "bad" },
      { kind: "mark", at: 2.5, actor: "s4", tone: "bad" },
      { kind: "verdict", at: 2.9, text: "Shard 4 runs at 210% of its limit", tone: "bad" },
    ],
    loop: 6.2,
  },
};
