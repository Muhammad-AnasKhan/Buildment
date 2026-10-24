import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.5 beat 3 (One pool, one slow friend).
export const sysdesignM16SharedPool: SceneSpec = {
  kind: "scene",
  title: "One shared pool: a slow Picks blocks payments too",
  purpose: "Checkout serves home pages and payments from one pool of workers. Home pages wait on a slow Picks and take every worker, so a payment request has to wait too.",
  limits: "One pool of 20 workers and one payment request. A real pool also has a queue limit and timeouts. The 2 s answer is a course number.",
  scene: {
    width: 420,
    height: 190,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "wants to pay", x: 60, y: 100 },
      { id: "checkout", label: "Checkout", kind: "server", sub: "pool 20 free", x: 210, y: 100 },
      { id: "picks", label: "Picks", kind: "server", sub: "answers 2 s", x: 360, y: 100 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "checkout", to: "picks", label: "picks?" },
      { kind: "fly", at: 0.8, dur: 0.7, from: "checkout", to: "picks", label: "picks?" },
      { kind: "say", at: 1.9, actor: "checkout", text: "pool 0 free", tone: "bad" },
      { kind: "mark", at: 1.9, actor: "checkout", tone: "bad" },
      { kind: "say", at: 1.9, actor: "picks", text: "stuck", tone: "warn" },
      { kind: "fly", at: 2.5, dur: 0.9, from: "phone", to: "checkout", label: "pay" },
      { kind: "say", at: 3.5, actor: "checkout", text: "pay waits", tone: "bad" },
      { kind: "say", at: 3.7, actor: "phone", text: "pay is stuck", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "Payments wait behind a slow extra", tone: "bad" }
    ],
    loop: 7.4,
  },
};
