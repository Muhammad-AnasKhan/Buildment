import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.4 beat 1: a cache with room for three items. Reading A moves it to the
// "recently used" end. Adding D needs a slot, so LRU drops the item used
// longest ago: B.
export const sysdesignM5LruEvict: SceneSpec = {
  kind: "scene",
  title: "A full cache drops the least recently used item",
  purpose: "The cache holds A, B and C. A read of A makes it recent; adding D forces one item out, and LRU picks B, the one used longest ago.",
  limits: "A cache with room for three items, kept in exact order. Redis and Valkey only approximate LRU: they sample a few keys and drop the oldest of the sample.",
  scene: {
    width: 420,
    height: 210,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "reads, writes", x: 60, y: 110 },
      { id: "cache", label: "Cache (3)", kind: "cache", sub: "old: A B C", x: 210, y: 110 },
      { id: "out", label: "Evicted", kind: "note", sub: "nothing yet", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "cache", label: "get A" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "cache", to: "app", label: "hit", tone: "good" },
      { kind: "say", at: 1.5, actor: "cache", text: "old: B C A" },
      { kind: "fly", at: 2.2, dur: 0.6, from: "app", to: "cache", label: "set D" },
      { kind: "say", at: 2.8, actor: "cache", text: "full: drop B", tone: "warn" },
      { kind: "fly", at: 3.1, dur: 0.7, from: "cache", to: "out", label: "B", tone: "warn" },
      { kind: "say", at: 3.8, actor: "out", text: "B: least recent", tone: "warn" },
      { kind: "say", at: 3.8, actor: "cache", text: "old: C A D", tone: "good" },
      { kind: "verdict", at: 4.2, text: "B was used longest ago, so B goes", tone: "warn" },
    ],
    loop: 7.5,
  },
};
