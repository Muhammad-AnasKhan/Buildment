import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.3 beat 5 (Others see the middle).
export const sysdesignM14SagaNotIsolated: SceneSpec = {
  kind: "scene",
  title: "While a saga runs, others can see its half-done state",
  purpose: "The saga holds the last bag, so Omar is told sold out. Then the payment fails and the bag is released. Omar saw a state that was later undone.",
  limits: "Made-up shop with one bag left. Real teams reduce this with countermeasures such as a 'pending' state, but a saga never gives full isolation.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "saga", label: "Order saga", kind: "server", sub: "Layla's order", x: 60, y: 90 },
      { id: "stock", label: "Stock", kind: "database", sub: "1 left", x: 210, y: 200 },
      { id: "omar", label: "Omar", kind: "phone", sub: "wants 1", x: 360, y: 90 },
      { id: "pay", label: "Payments", kind: "server", sub: "idle", x: 60, y: 300 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "saga", to: "stock", label: "reserve" },
      { kind: "say", at: 1.1, actor: "stock", text: "0 left (held)", tone: "warn" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "omar", to: "stock", label: "buy 1" },
      { kind: "fly", at: 2.2, dur: 0.8, from: "stock", to: "omar", label: "sold out" },
      { kind: "say", at: 3, actor: "omar", text: "told sold out", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "saga", to: "pay", label: "charge" },
      { kind: "say", at: 4.1, actor: "pay", text: "declined", tone: "bad" },
      { kind: "fly", at: 4.4, dur: 0.8, from: "saga", to: "stock", label: "release" },
      { kind: "say", at: 5.2, actor: "stock", text: "1 left", tone: "good" },
      { kind: "verdict", at: 5.6, text: "Omar saw a state that was undone", tone: "warn" },
    ],
    loop: 8.6,
  },
};
