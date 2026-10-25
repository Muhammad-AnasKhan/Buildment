import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.4 beat 6 (A retry budget).
export const sysdesignM16RetryBudget: SceneSpec = {
  kind: "scene",
  title: "A retry budget stops retries when the stock runs out",
  purpose: "A client has a budget of two retries. Picks keeps failing. Each retry spends one unit, and when the budget is empty the client stops retrying and fails fast.",
  limits: "The budget is shown as a small stock of 2 retries. In the chapter's code it refills by 1 unit per request and a retry costs 10 units, so retries stay near 10% of requests.",
  scene: {
    width: 420,
    height: 190,
    actors: [
      { id: "client", label: "Client", kind: "server", sub: "budget: 2", x: 70, y: 100 },
      { id: "picks", label: "Picks", kind: "server", sub: "failing", x: 350, y: 100 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "client", to: "picks", label: "call" },
      { kind: "say", at: 1.2, actor: "picks", text: "error", tone: "bad" },
      { kind: "fly", at: 1.7, dur: 0.9, from: "client", to: "picks", label: "retry 1" },
      { kind: "say", at: 2.6, actor: "client", text: "budget: 1", tone: "warn" },
      { kind: "fly", at: 3, dur: 0.9, from: "client", to: "picks", label: "retry 2" },
      { kind: "say", at: 3.9, actor: "client", text: "budget: 0", tone: "warn" },
      { kind: "say", at: 4.3, actor: "client", text: "no retry: fail", tone: "bad" },
      { kind: "mark", at: 4.3, actor: "client", tone: "bad" },
      { kind: "verdict", at: 4.8, text: "Budget empty: no more retries", tone: "warn" }
    ],
    loop: 8,
  },
};
