import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.4 beat 1 (Give every call a time limit).
export const sysdesignM16TimeoutFires: SceneSpec = {
  kind: "scene",
  title: "A time limit lets Checkout give up and carry on",
  purpose: "Checkout asks a slow Picks service for a row and waits at most 200 ms. The limit fires, Checkout builds the page without the row, and the page loads.",
  limits: "One call and one limit. The 200 ms limit is a course number; the next beat shows how to choose it from real latencies.",
  scene: {
    width: 420,
    height: 190,
    actors: [
      { id: "checkout", label: "Checkout", kind: "server", sub: "building page", x: 80, y: 100 },
      { id: "picks", label: "Picks", kind: "server", sub: "answers 2 s", x: 340, y: 100 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "checkout", to: "picks", label: "picks?" },
      { kind: "say", at: 1.2, actor: "picks", text: "slow today", tone: "warn" },
      { kind: "wait", at: 1.2, dur: 2.4, actor: "checkout", label: "wait {n} ms", doneLabel: "limit hit", total: 200 },
      { kind: "say", at: 3.8, actor: "checkout", text: "gave up", tone: "warn" },
      { kind: "say", at: 4.3, actor: "checkout", text: "page w/o picks", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Gave up at 200 ms, page still loads", tone: "good" }
    ],
    loop: 7.4,
  },
};
