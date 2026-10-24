import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.2: the same 800 a second of capacity as one big server or as eight small
// ones. One machine fails in each.
export const sysdesignM4BlastRadius: SceneSpec = {
  kind: "scene",
  title: "The same failure, two different losses",
  purpose: "One big server and eight small ones have the same capacity. When one machine fails, the big design loses everything and the small design loses one eighth.",
  limits: "Assumes the load balancer in front of the eight small servers notices the failure at once (4.4 shows it takes a few seconds) and that the other seven have room for the extra work. Both designs serve 400 requests a second, half of their 800.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "u1", label: "Students", kind: "user", sub: "400/s", x: 62, y: 95 },
      { id: "big", label: "1 big", kind: "server", sub: "800/s", x: 358, y: 95 },
      { id: "u2", label: "Students", kind: "user", sub: "400/s", x: 62, y: 205 },
      { id: "fleet", label: "8 small", kind: "server", sub: "8 x 100/s", x: 358, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "u1", to: "big", label: "pages" },
      { kind: "fly", at: 0.2, dur: 0.9, from: "u2", to: "fleet", label: "pages" },
      { kind: "say", at: 1.8, actor: "big", text: "failed", tone: "bad" },
      { kind: "mark", at: 1.8, actor: "big", tone: "bad" },
      { kind: "say", at: 1.8, actor: "fleet", text: "1 of 8 failed", tone: "warn" },
      { kind: "mark", at: 1.8, actor: "fleet", tone: "warn" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "u1", to: "big", label: "pages" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "u2", to: "fleet", label: "pages" },
      { kind: "say", at: 3.5, actor: "u1", text: "all errors", tone: "bad" },
      { kind: "say", at: 3.5, actor: "fleet", text: "7 left: 700/s", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "fleet", to: "u2", label: "served", tone: "good" },
      { kind: "say", at: 4.4, actor: "u2", text: "all served", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Same failure: 100% lost vs 12.5%", tone: "warn" },
    ],
    loop: 7.6,
  },
};
