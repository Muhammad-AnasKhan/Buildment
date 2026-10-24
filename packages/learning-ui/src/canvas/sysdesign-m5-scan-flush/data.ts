import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.4 beat 2: a hot key A is read all day. A nightly report reads many rows
// once each. Under LRU each new row is "recent", so the rows push A out, and
// the next shopper read of A misses. LFU counts uses and would keep A.
export const sysdesignM5ScanFlush: SceneSpec = {
  kind: "scene",
  title: "One big scan pushes out the hot key",
  purpose: "A report reads many rows once each; under LRU those rows look recent, so they push out A, the key shoppers read all day.",
  limits: "Three rows stand for thousands, and the cache is drawn tiny. LFU would keep A here because it counts uses, but a pure count can also keep a key that was popular yesterday and is cold today.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "shoppers", label: "Shoppers", kind: "user", sub: "read A all day", x: 60, y: 100 },
      { id: "report", label: "Report job", kind: "worker", sub: "reads each once", x: 60, y: 220 },
      { id: "cache", label: "Cache (LRU)", kind: "cache", sub: "has A", x: 210, y: 160 },
      { id: "out", label: "Evicted", kind: "note", sub: "nothing yet", x: 360, y: 160 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "shoppers", to: "cache", label: "get A" },
      { kind: "say", at: 0.7, actor: "cache", text: "hit: A is hot", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.5, from: "report", to: "cache", label: "row 1" },
      { kind: "fly", at: 1.4, dur: 0.5, from: "report", to: "cache", label: "row 2" },
      { kind: "fly", at: 1.6, dur: 0.5, from: "report", to: "cache", label: "row 3" },
      { kind: "say", at: 2.1, actor: "cache", text: "full of rows", tone: "warn" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "cache", to: "out", label: "A", tone: "bad" },
      { kind: "say", at: 2.9, actor: "out", text: "A, the hot one", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.5, from: "shoppers", to: "cache", label: "get A" },
      { kind: "say", at: 3.7, actor: "cache", text: "miss on A", tone: "bad" },
      { kind: "say", at: 3.9, actor: "shoppers", text: "slow page", tone: "warn" },
      { kind: "verdict", at: 4.1, text: "LRU forgot A after one scan", tone: "bad" },
    ],
    loop: 7.5,
  },
};
