import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.2 beat 5: A word that few products contain adds more to the score than a common one.
export const sysdesignM23RareWords: SceneSpec = {
  kind: "scene",
  title: "A rare word adds more to a score than a common one",
  purpose: "The ranker adds a weight for each query word a product contains. Red is in 2 of 3 products and weighs 0.4. Waterproof is in 1 of 3 and weighs 1.1. Product 3 wins because it has the rare word.",
  limits: "Each word appears once in each product, so only rarity matters here. Real scores also count how often a word repeats, how long the product text is, and signals such as sales and ratings.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "d1", label: "Product 1", kind: "note", sub: "red, shoe", x: 70, y: 205 },
      { id: "ranker", label: "Ranker", kind: "worker", sub: "adds weights", x: 210, y: 100 },
      { id: "d3", label: "Product 3", kind: "note", sub: "red, shoe, +1", x: 350, y: 205 },
    ],
    strip: { y: 322, from: 0, to: 2.2, unit: "score", caption: "score so far", every: 0.5 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "ranker", to: "d1", label: "red 0.4" },
      { kind: "fly", at: 1.0, dur: 0.6, from: "ranker", to: "d1", label: "shoe 0.4" },
      { kind: "say", at: 1.7, actor: "d1", text: "score 0.81", tone: "accent" },
      { kind: "tag", at: 1.7, row: 0, value: 0.81, label: "p1 0.81", tone: "accent" },
      { kind: "fly", at: 2.2, dur: 0.6, from: "ranker", to: "d3", label: "red 0.4" },
      { kind: "fly", at: 2.9, dur: 0.6, from: "ranker", to: "d3", label: "waterproof 1.1", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 0.6, from: "ranker", to: "d3", label: "shoe 0.4" },
      { kind: "say", at: 4.3, actor: "d3", text: "score 1.91", tone: "good" },
      { kind: "tag", at: 4.3, row: 1, value: 1.91, label: "p3 1.91", tone: "good" },
      { kind: "verdict", at: 4.7, text: "Product 3 wins on one rare word", tone: "good" },
    ],
    loop: 8,
  },
};
