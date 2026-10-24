import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.2 beat 2 (A call that can fail).
export const sysdesignM16CallCanFail: SceneSpec = {
  kind: "scene",
  title: "Across a network, a call can fail or hang",
  purpose: "Checkout asks the Payments service for a price. The first call is answered. The second gets no answer, and Checkout waits until it gives up.",
  limits: "One call, one wait. The 300 ms limit and the answers are course numbers. Inside one program the same step is a function call, which cannot time out in this way.",
  scene: {
    width: 420,
    height: 190,
    actors: [
      { id: "checkout", label: "Checkout", kind: "server", sub: "needs a price", x: 80, y: 100 },
      { id: "payments", label: "Payments", kind: "server", sub: "other server", x: 340, y: 100 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "checkout", to: "payments", label: "price?" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "payments", to: "checkout", label: "price: 12", tone: "good" },
      { kind: "say", at: 2.3, actor: "checkout", text: "got a price", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.9, from: "checkout", to: "payments", label: "price?" },
      { kind: "say", at: 3.7, actor: "payments", text: "no answer", tone: "warn" },
      { kind: "mark", at: 3.7, actor: "payments", tone: "warn" },
      { kind: "wait", at: 3.7, dur: 1.8, actor: "checkout", label: "wait {n} ms", doneLabel: "gave up", total: 300 },
      { kind: "say", at: 5.6, actor: "checkout", text: "call failed", tone: "bad" },
      { kind: "verdict", at: 5.8, text: "A network call can fail or hang", tone: "warn" }
    ],
    loop: 8.6,
  },
};
