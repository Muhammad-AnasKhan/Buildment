import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.4 beat 4: each backend call is slow 1 time in 100. A page that waits for
// n calls is slow with chance 1 - 0.99^n: 1% (n=1), 10% (10), 39% (50), 63% (100).
export const sysdesignM2FanOutOdds: SceneSpec = {
  kind: "scene",
  title: "Rare slowness becomes the normal case",
  purpose: "The more backends one page waits for, the more likely one of them is having a slow moment.",
  limits: "Assumes each call is slow 1 time in 100, independently of the others, as in the example in Dean and Barroso's The Tail at Scale (100 calls gives 63%). Real slow moments are often linked, for example a garbage collection pause that hits many calls at once.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "page", kind: "server", label: "One page", sub: "waits for all", x: 60, y: 110 },
      { id: "backends", kind: "server", label: "Backends", sub: "1% slow each", x: 360, y: 110 },
    ],
    strip: { y: 280, from: 0, to: 100, unit: "", caption: "calls one page waits for", every: 25 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "page", to: "backends", label: "1 call" },
      { kind: "say", at: 0.9, actor: "page", text: "1% slow" },
      { kind: "tag", at: 0.9, row: 1, value: 1, label: "1: 1% slow" },
      { kind: "fly", at: 1.3, dur: 0.6, from: "page", to: "backends", label: "10 calls" },
      { kind: "say", at: 1.9, actor: "page", text: "10% slow", tone: "warn" },
      { kind: "tag", at: 1.9, row: 0, value: 10, label: "10: 10% slow", tone: "warn" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "page", to: "backends", label: "50 calls" },
      { kind: "say", at: 2.9, actor: "page", text: "39% slow", tone: "warn" },
      { kind: "tag", at: 2.9, row: 1, value: 50, label: "50: 39% slow", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 0.6, from: "page", to: "backends", label: "100 calls" },
      { kind: "say", at: 3.9, actor: "page", text: "63% slow", tone: "bad" },
      { kind: "mark", at: 3.9, actor: "page", tone: "bad" },
      { kind: "tag", at: 3.9, row: 0, value: 100, label: "100: 63% slow", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "100 calls: 63% of pages slow", tone: "bad" },
    ],
    loop: 7.2,
  },
};
