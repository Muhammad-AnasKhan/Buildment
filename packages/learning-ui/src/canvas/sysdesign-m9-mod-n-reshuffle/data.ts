import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.2 beat 5: shard = hash mod N. Going from 4 shards to 5 changes the answer
// for most keys. A key stays only when hash mod 4 equals hash mod 5, which is
// 1 key in 5, so 80% move (80.2% of 100,000 keys in the course test).
export const sysdesignM9ModNReshuffle: SceneSpec = {
  kind: "scene",
  title: "Hash mod N: adding a shard moves most keys",
  purpose: "With shard = hash mod N, going from 4 shards to 5 gives most keys a new home. Key 17 moves; key 20 is one of the few that stay.",
  limits: "Two keys stand for 100,000. Only 1 key in 5 keeps its shard when N goes from 4 to 5, so about 80% move (80.2% in the course test). The more shards you have, the worse it gets: from 10 to 11, 91% move.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "k17", label: "Key 17", kind: "note", sub: "hash 17", x: 60, y: 100 },
      { id: "a1", label: "Shard 1 of 4", kind: "database", sub: "17 mod 4 = 1", x: 210, y: 100 },
      { id: "b1", label: "Shard 2 of 5", kind: "database", sub: "17 mod 5 = 2", x: 360, y: 100 },
      { id: "k20", label: "Key 20", kind: "note", sub: "hash 20", x: 60, y: 200 },
      { id: "a0", label: "Shard 0 of 4", kind: "database", sub: "20 mod 4 = 0", x: 210, y: 200 },
      { id: "b0", label: "Shard 0 of 5", kind: "database", sub: "20 mod 5 = 0", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "k17", to: "a1", label: "store" },
      { kind: "fly", at: 0.5, dur: 0.6, from: "k20", to: "a0", label: "store" },
      { kind: "fly", at: 1.6, dur: 0.8, from: "a1", to: "b1", label: "moves", tone: "bad" },
      { kind: "say", at: 2.4, actor: "b1", text: "17 moved", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "b1", tone: "bad" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "a0", to: "b0", label: "stays", tone: "good" },
      { kind: "say", at: 3.6, actor: "b0", text: "20 stayed", tone: "good" },
      { kind: "verdict", at: 4.0, text: "Adding 1 shard moves 80% of keys", tone: "bad" },
    ],
    loop: 7.4,
  },
};
