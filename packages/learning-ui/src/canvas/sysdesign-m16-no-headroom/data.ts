import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.6 beat 4 (Redundancy needs spare room).
export const sysdesignM16NoHeadroom: SceneSpec = {
  kind: "scene",
  title: "Two servers at 60% cannot lose one",
  purpose: "Two servers share 120 requests a second, 60% busy each. One crashes and the other must take all 120, which is 120% of what it can do.",
  limits: "Two identical servers that can each do 100 requests a second, and steady traffic. Real systems add autoscaling and queues, which take time to help.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "lb", label: "Balancer", kind: "router", sub: "120 req/s total", x: 60, y: 145 },
      { id: "a", label: "Server A", kind: "server", sub: "60% busy", x: 300, y: 100 },
      { id: "b", label: "Server B", kind: "server", sub: "60% busy", x: 300, y: 200 }
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "lb", to: "a", label: "60/s" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "lb", to: "b", label: "60/s" },
      { kind: "say", at: 1.8, actor: "b", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1.8, actor: "b", tone: "bad" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "lb", to: "a", label: "120/s" },
      { kind: "say", at: 3.4, actor: "a", text: "120% busy", tone: "bad" },
      { kind: "mark", at: 3.4, actor: "a", tone: "bad" },
      { kind: "verdict", at: 3.9, text: "Lost one, the other is overloaded", tone: "bad" }
    ],
    loop: 7,
  },
};
