import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.2 beat 1: orders split into four shards by order date (range partitioning).
// Every new order has today's date, so the newest range takes all the writes:
// 3,000 a second against a 1,000 a second limit per shard (the DynamoDB
// per-partition write limit, used as the course's shard limit).
export const sysdesignM9RangeHotTail: SceneSpec = {
  kind: "scene",
  title: "Range by date: the newest shard takes every write",
  purpose: "Orders are split into four shards by date. New orders always carry today's date, so one shard gets all 3,000 writes a second.",
  limits: "Made-up story: four shards by quarter, 3,000 writes a second, and a limit of 1,000 writes a second per shard (the DynamoDB per-partition write limit, used here as a round number). Real range-partitioned systems often split the hot range, which helps but does not remove the pattern.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "app", label: "Suq app", kind: "server", sub: "3,000 writes/s", x: 60, y: 150 },
      { id: "s1", label: "Shard 1", kind: "database", sub: "Jan to Mar", x: 210, y: 100 },
      { id: "s2", label: "Shard 2", kind: "database", sub: "Apr to Jun", x: 360, y: 100 },
      { id: "s3", label: "Shard 3", kind: "database", sub: "Jul to Sep", x: 210, y: 200 },
      { id: "s4", label: "Shard 4", kind: "database", sub: "Oct to Dec", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "app", to: "s4", label: "order Nov 12" },
      { kind: "fly", at: 0.7, dur: 0.7, from: "app", to: "s4", label: "order Nov 12" },
      { kind: "fly", at: 1.1, dur: 0.7, from: "app", to: "s4", label: "order Nov 12" },
      { kind: "say", at: 1.9, actor: "s4", text: "3,000 writes/s", tone: "bad" },
      { kind: "mark", at: 1.9, actor: "s4", tone: "bad" },
      { kind: "say", at: 2.2, actor: "s1", text: "0 writes/s", tone: "warn" },
      { kind: "say", at: 2.2, actor: "s2", text: "0 writes/s", tone: "warn" },
      { kind: "say", at: 2.2, actor: "s3", text: "0 writes/s", tone: "warn" },
      { kind: "verdict", at: 2.6, text: "The newest range takes every write", tone: "bad" },
    ],
    loop: 6,
  },
};
