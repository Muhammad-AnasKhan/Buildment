import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.2 beat 2: the same 3,000 writes a second, but each order's shard is chosen
// by hashing its id. Each shard gets about a quarter: 750 a second.
export const sysdesignM9HashSpread: SceneSpec = {
  kind: "scene",
  title: "Hash by order id: writes spread evenly",
  purpose: "The app hashes each order id and the result picks the shard, so the same 3,000 writes a second spread to about 750 on each of four shards.",
  limits: "Made-up story numbers, and a perfect spread is assumed. With many orders a good hash comes close to it (about 25% each in a 100,000 key test), but it can never keep two neighbouring dates together.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "app", label: "Suq app", kind: "server", sub: "hash(order id)", x: 60, y: 150 },
      { id: "s1", label: "Shard 1", kind: "database", sub: "1 in 4 keys", x: 210, y: 100 },
      { id: "s2", label: "Shard 2", kind: "database", sub: "1 in 4 keys", x: 360, y: 100 },
      { id: "s3", label: "Shard 3", kind: "database", sub: "1 in 4 keys", x: 210, y: 200 },
      { id: "s4", label: "Shard 4", kind: "database", sub: "1 in 4 keys", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "app", to: "s3", label: "order 9041" },
      { kind: "fly", at: 0.6, dur: 0.7, from: "app", to: "s1", label: "order 9042" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "app", to: "s4", label: "order 9043" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "app", to: "s2", label: "order 9044" },
      { kind: "say", at: 2.0, actor: "s1", text: "750 writes/s", tone: "good" },
      { kind: "say", at: 2.0, actor: "s2", text: "750 writes/s", tone: "good" },
      { kind: "say", at: 2.0, actor: "s3", text: "750 writes/s", tone: "good" },
      { kind: "say", at: 2.0, actor: "s4", text: "750 writes/s", tone: "good" },
      { kind: "verdict", at: 2.4, text: "Writes spread evenly", tone: "good" },
    ],
    loop: 5.6,
  },
};
