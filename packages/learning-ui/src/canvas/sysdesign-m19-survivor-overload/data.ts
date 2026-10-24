import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.5 beat 4 (The survivor must carry everyone). Two regions each run at 50 of 60 and one fails.
export const sysdesignM19SurvivorOverload: SceneSpec = {
  kind: "scene",
  title: "Region B was sized for half the traffic",
  purpose: "Each region serves 50 requests a second and can handle 60. When Region A fails, its users move to B, which now gets 100 and can only serve 60.",
  limits: "Two regions, steady traffic and made-up numbers. Real overload also brings retries, which add more load and can keep the survivor down after the cause is gone.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "ua", label: "A's users", kind: "phone", sub: "50 req/s", x: 62, y: 105 },
      { id: "ub", label: "B's users", kind: "phone", sub: "50 req/s", x: 62, y: 215 },
      { id: "a", label: "Region A", kind: "server", sub: "50 of 60 ok", x: 358, y: 105 },
      { id: "b", label: "Region B", kind: "server", sub: "50 of 60 ok", x: 358, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "ua", to: "a", label: "orders" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "ub", to: "b", label: "orders" },
      { kind: "say", at: 1.6, actor: "a", text: "down", tone: "bad" },
      { kind: "mark", at: 1.6, actor: "a", tone: "bad" },
      { kind: "fly", at: 2.2, dur: 1.1, from: "ua", to: "b", label: "orders" },
      { kind: "fly", at: 2.2, dur: 1.1, from: "ub", to: "b", label: "orders" },
      { kind: "say", at: 3.4, actor: "b", text: "100 of 60", tone: "bad" },
      { kind: "mark", at: 3.4, actor: "b", tone: "bad" },
      { kind: "say", at: 3.9, actor: "ua", text: "errors", tone: "bad" },
      { kind: "say", at: 3.9, actor: "ub", text: "errors", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "Survivor sized for half melts down", tone: "bad" },
    ],
    loop: 7.4,
  },
};
