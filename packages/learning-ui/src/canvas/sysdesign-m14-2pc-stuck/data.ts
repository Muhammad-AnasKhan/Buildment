import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.2 beat 4 (Locked rows queue up).
export const sysdesignM14TwoPcStuck: SceneSpec = {
  kind: "scene",
  title: "The coordinator crashes after the votes, and two databases wait",
  purpose: "Both databases voted yes and hold locks. The coordinator dies before it sends the decision, so they cannot move and new orders queue up.",
  limits: "An illustrative 2 orders per second on the same rows, so waiting orders grow by 2 each second. Real lock conflicts depend on which rows an order touches.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "coord", label: "Coordinator", kind: "server", sub: "decides", x: 210, y: 100 },
      { id: "a", label: "Stock DB", kind: "database", sub: "working", x: 60, y: 220 },
      { id: "b", label: "Payments DB", kind: "database", sub: "working", x: 360, y: 220 },
      { id: "q", label: "Other orders", kind: "queue", sub: "0 waiting", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "coord", to: "a", label: "prepare?" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "coord", to: "b", label: "prepare?" },
      { kind: "say", at: 1.2, actor: "a", text: "locked, ready", tone: "accent" },
      { kind: "say", at: 1.2, actor: "b", text: "locked, ready", tone: "accent" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "a", to: "coord", label: "yes", tone: "good" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "b", to: "coord", label: "yes", tone: "good" },
      { kind: "say", at: 2.4, actor: "coord", text: "crashed", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "coord", tone: "bad" },
      { kind: "say", at: 3, actor: "a", text: "waiting", tone: "warn" },
      { kind: "say", at: 3, actor: "b", text: "waiting", tone: "warn" },
      { kind: "say", at: 3.5, actor: "q", text: "5 waiting", tone: "warn" },
      { kind: "say", at: 4.3, actor: "q", text: "30 waiting", tone: "bad" },
      { kind: "verdict", at: 4.9, text: "Rows stay locked until it is back", tone: "bad" },
    ],
    loop: 8,
  },
};
