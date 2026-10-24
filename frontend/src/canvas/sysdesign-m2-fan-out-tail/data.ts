import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.4 beat 3: one page calls three backends in parallel and needs all three
// answers. Two answer in about 10 ms; one is slow (1 s), so the page is too.
export const sysdesignM2FanOutTail: SceneSpec = {
  kind: "scene",
  title: "A page is as slow as its slowest call",
  purpose: "The page sends three calls at once and can only answer when the last one is back.",
  limits: "Three backends keep the picture readable; real pages can call tens or hundreds. The 1 s slow answer matches the example in Dean and Barroso's The Tail at Scale; the fast times are made up.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "b1", kind: "server", label: "Profile", sub: "backend 1", x: 70, y: 95 },
      { id: "b2", kind: "server", label: "Feed", sub: "backend 2", x: 210, y: 95 },
      { id: "b3", kind: "server", label: "Ads", sub: "backend 3", x: 350, y: 95 },
      { id: "page", kind: "server", label: "Page", sub: "calls 3", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "page", to: "b1", label: "call" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "page", to: "b2", label: "call" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "page", to: "b3", label: "call" },
      { kind: "say", at: 1.1, actor: "b1", text: "10 ms", tone: "good" },
      { kind: "say", at: 1.1, actor: "b2", text: "12 ms", tone: "good" },
      { kind: "say", at: 1.1, actor: "b3", text: "slow: 1 s", tone: "bad" },
      { kind: "mark", at: 1.1, actor: "b3", tone: "bad" },
      { kind: "wait", at: 1.1, dur: 2.6, actor: "page", label: "waiting {n} ms", doneLabel: "waited 1000 ms", total: 1000 },
      { kind: "fly", at: 1.2, dur: 0.8, from: "b1", to: "page", label: "done", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "b2", to: "page", label: "done", tone: "good" },
      { kind: "say", at: 2.1, actor: "page", text: "2 of 3 back" },
      { kind: "fly", at: 3.0, dur: 0.7, from: "b3", to: "page", label: "done", tone: "bad" },
      { kind: "say", at: 3.7, actor: "page", text: "ready: 1,000 ms", tone: "bad" },
      { kind: "verdict", at: 3.9, text: "The slowest call sets the page's p99", tone: "bad" },
    ],
    loop: 7,
  },
};
