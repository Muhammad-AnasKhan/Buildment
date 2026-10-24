import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.4 beat 3: the same cache, room for 1,000 of 10,000 products, under two
// kinds of traffic. If every product is equally popular, a read finds its
// product in the cache 10% of the time. If popularity follows a Zipf curve
// with exponent 1 (the k-th product is read in proportion to 1/k), the top
// 1,000 products get 76.5% of all reads (computed: H(1,000) / H(10,000)).
export const sysdesignM5WorkingSet: SceneSpec = {
  kind: "scene",
  title: "Same cache, very different hit rates",
  purpose: "A cache that holds the top 1,000 of 10,000 products catches 10% of reads when traffic is even, and 76.5% when a few products get most reads.",
  limits: "Both shops have 10,000 products and the cache holds the 1,000 most read. The skewed shop follows an exact Zipf curve with exponent 1, a common model; real traffic is only roughly like it. A real cache with LRU does a little worse than holding the exact top 1,000.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "even", label: "Even shop", kind: "user", sub: "all equal", x: 60, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "1,000 of 10,000", x: 210, y: 100 },
      { id: "skew", label: "Skewed shop", kind: "user", sub: "few are hot", x: 360, y: 100 },
    ],
    strip: { y: 268, from: 0, to: 100, unit: "%", caption: "share of reads that hit", every: 25 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "even", to: "cache", label: "item 7,312" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "cache", to: "even", label: "miss", tone: "warn" },
      { kind: "say", at: 1.7, actor: "even", text: "1 in 10 hits", tone: "warn" },
      { kind: "tag", at: 1.8, row: 0, value: 10, label: "even: 10%", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.7, from: "skew", to: "cache", label: "top seller" },
      { kind: "fly", at: 3.1, dur: 0.7, from: "cache", to: "skew", label: "hit", tone: "good" },
      { kind: "say", at: 3.8, actor: "skew", text: "3 in 4 hit", tone: "good" },
      { kind: "tag", at: 3.9, row: 1, value: 76.5, label: "skewed: 76.5%", tone: "good" },
      { kind: "verdict", at: 4.3, text: "Same cache: 10% or 76.5% hits", tone: "good" },
    ],
    loop: 7.8,
  },
};
