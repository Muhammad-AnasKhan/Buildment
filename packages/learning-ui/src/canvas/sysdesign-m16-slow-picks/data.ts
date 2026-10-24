import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.1 beat 1 (One slow extra, every page stuck).
export const sysdesignM16SlowPicks: SceneSpec = {
  kind: "scene",
  title: "A slow Picks service fills every worker in Checkout",
  purpose: "Picks (the 'you may also like' row) goes from 40 ms to 10 s. Each page holds a Checkout worker while it waits, so all 50 workers are stuck in under a second and no page loads.",
  limits: "A made-up delivery app. 100 pages a second, 50 workers and about 100 ms of worker time per page are course numbers chosen for easy arithmetic (100 x 0.1 s = 10 busy). Real servers also queue, time out and retry, which later chapters add.",
  scene: {
    width: 420,
    height: 190,
    actors: [
      { id: "phones", label: "Phones", kind: "phone", sub: "100 pages/s", x: 60, y: 100 },
      { id: "checkout", label: "Checkout", kind: "server", sub: "10 busy of 50", x: 210, y: 100 },
      { id: "picks", label: "Picks", kind: "server", sub: "answers 40 ms", x: 360, y: 100 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "phones", to: "checkout", label: "page" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "checkout", to: "picks", label: "picks?" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "picks", to: "checkout", label: "40 ms", tone: "good" },
      { kind: "say", at: 2.9, actor: "picks", text: "answers 10 s", tone: "warn" },
      { kind: "mark", at: 2.9, actor: "picks", tone: "warn" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "phones", to: "checkout", label: "page" },
      { kind: "fly", at: 4, dur: 0.8, from: "checkout", to: "picks", label: "picks?" },
      { kind: "say", at: 4.9, actor: "checkout", text: "50 busy of 50", tone: "bad" },
      { kind: "mark", at: 4.9, actor: "checkout", tone: "bad" },
      { kind: "say", at: 5.3, actor: "phones", text: "no page loads", tone: "bad" },
      { kind: "verdict", at: 5.6, text: "One slow extra stopped every page", tone: "bad" }
    ],
    loop: 8.8,
  },
};
