import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.4 beat 1: A Bloom filter of every known word says a sure no to a typo, so no shard is asked.
export const sysdesignM23TypoFilter: SceneSpec = {
  kind: "scene",
  title: "A sure no from the filter saves eight shard calls",
  purpose: "The filter holds every word in the catalogue. A typo like shoez is not in it, so the filter answers no at once and no shard is asked. A real word gets a maybe, and the search runs on all eight shards.",
  limits: "A false maybe costs one wasted search, never a wrong answer. The filter cannot forget a word, so it is rebuilt from the word list now and then. It helps only queries that match nothing.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "searches", x: 70, y: 100 },
      { id: "filter", label: "Word filter", kind: "cache", sub: "125 MB, in RAM", x: 350, y: 100 },
      { id: "shards", label: "8 shards", kind: "database", sub: "the catalogue", x: 350, y: 240 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "phone", to: "filter", label: "shoez" },
      { kind: "say", at: 1.1, actor: "filter", text: "never seen", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "filter", to: "phone", label: "no", tone: "good" },
      { kind: "say", at: 2.1, actor: "phone", text: "0 shard calls", tone: "good" },
      { kind: "fly", at: 3.0, dur: 0.8, from: "phone", to: "filter", label: "shoes" },
      { kind: "say", at: 3.8, actor: "filter", text: "maybe", tone: "warn" },
      { kind: "fly", at: 4.0, dur: 0.9, from: "filter", to: "shards", label: "ask all" },
      { kind: "fly", at: 5.0, dur: 1.1, from: "shards", to: "phone", label: "results", tone: "good" },
      { kind: "verdict", at: 6.1, text: "A sure no skips all 8 shards", tone: "good" },
    ],
    loop: 9,
  },
};
