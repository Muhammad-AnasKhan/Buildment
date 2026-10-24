import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.5 beat 2: Each view adds 1 to one of three shards; a read adds the shards up.
export const sysdesignM27ShardsSplit: SceneSpec = {
  kind: "scene",
  title: "Split one count into many rows",
  purpose: "Instead of one row, the count lives in three shard rows. Each view adds 1 to a shard chosen at random, so each shard sees a third of the writes. To read the count, the page adds the three shards up.",
  limits: "Three shards for the picture; the real number comes from the write rate (chapter 27.5). The shard is chosen at random, so in any one second the busiest shard is a little above the average. A full read touches every shard, which is why chapter 27.5 adds a periodic merge.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "App server", kind: "server", sub: "a view arrives", x: 60, y: 100 },
      { id: "page", label: "Watch page", kind: "user", sub: "wants the count", x: 360, y: 100 },
      { id: "s1", label: "Shard 1", kind: "database", sub: "412", x: 60, y: 235 },
      { id: "s2", label: "Shard 2", kind: "database", sub: "398", x: 210, y: 235 },
      { id: "s3", label: "Shard 3", kind: "database", sub: "394", x: 360, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "app", to: "s2", label: "+1" },
      { kind: "say", at: 0.9, actor: "s2", text: "399", tone: "good" },
      { kind: "fly", at: 1.1, dur: 0.7, from: "app", to: "s1", label: "+1" },
      { kind: "say", at: 1.8, actor: "s1", text: "413", tone: "good" },
      { kind: "fly", at: 2.0, dur: 0.7, from: "app", to: "s3", label: "+1" },
      { kind: "say", at: 2.7, actor: "s3", text: "395", tone: "good" },
      { kind: "fly", at: 3.1, dur: 0.7, from: "s1", to: "page", label: "413" },
      { kind: "fly", at: 3.4, dur: 0.7, from: "s2", to: "page", label: "399" },
      { kind: "fly", at: 3.7, dur: 0.7, from: "s3", to: "page", label: "395" },
      { kind: "say", at: 4.4, actor: "page", text: "sum: 1,207", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Writes spread, reads add up", tone: "good" },
    ],
    loop: 7.5,
  },
};
