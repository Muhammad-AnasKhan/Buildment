import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.6 beat 1: orders are sharded by order id, so one buyer's orders sit on
// every shard. A search by buyer goes to all four shards (scatter), waits for
// all four answers and merges them (gather). Three shards answer in 5 ms; one
// is slow and takes 200 ms, so the search takes 200 ms.
export const sysdesignM9ScatterGather: SceneSpec = {
  kind: "scene",
  title: "Search by buyer asks every shard",
  purpose: "Orders are placed by order id, so Sara's orders are spread over all four shards. The search asks all four and can only answer when the slowest one has.",
  limits: "Four shards keep the picture small; with 20 shards, each slow 1 time in 100, about 18% of searches would hit a slow shard (1 - 0.99^20). The 5 ms and 200 ms times are made up for the story.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "Search", kind: "server", sub: "buyer = Sara", x: 60, y: 150 },
      { id: "s1", label: "Shard 1", kind: "database", sub: "has 1 order", x: 210, y: 100 },
      { id: "s2", label: "Shard 2", kind: "database", sub: "has 2 orders", x: 360, y: 100 },
      { id: "s3", label: "Shard 3", kind: "database", sub: "has 0 orders", x: 210, y: 200 },
      { id: "s4", label: "Shard 4", kind: "database", sub: "has 1 order", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "s1", label: "find Sara" },
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "s2", label: "find Sara" },
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "s3", label: "find Sara" },
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "s4", label: "find Sara" },
      { kind: "say", at: 0.9, actor: "s1", text: "5 ms", tone: "good" },
      { kind: "say", at: 0.9, actor: "s2", text: "5 ms", tone: "good" },
      { kind: "say", at: 0.9, actor: "s3", text: "5 ms", tone: "good" },
      { kind: "say", at: 0.9, actor: "s4", text: "slow: 200 ms", tone: "bad" },
      { kind: "mark", at: 0.9, actor: "s4", tone: "bad" },
      { kind: "wait", at: 0.9, dur: 2.4, actor: "app", label: "waiting {n} ms", doneLabel: "waited 200 ms", total: 200 },
      { kind: "fly", at: 1.0, dur: 0.6, from: "s1", to: "app", label: "1 order", tone: "good" },
      { kind: "fly", at: 1.1, dur: 0.6, from: "s2", to: "app", label: "2 orders", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.6, from: "s3", to: "app", label: "none", tone: "good" },
      { kind: "say", at: 1.9, actor: "app", text: "3 of 4 back" },
      { kind: "fly", at: 2.8, dur: 0.6, from: "s4", to: "app", label: "1 order", tone: "bad" },
      { kind: "say", at: 3.4, actor: "app", text: "ready: 200 ms", tone: "bad" },
      { kind: "verdict", at: 3.6, text: "Search waits for its slowest shard", tone: "bad" },
    ],
    loop: 7,
  },
};
