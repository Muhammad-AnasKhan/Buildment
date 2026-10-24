import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.6 beat 5: both app copies run on one physical host. The host loses power,
// both copies go down together, and the parallel maths no longer holds.
export const sysdesignM2SharedPower: SceneSpec = {
  kind: "scene",
  title: "Two copies on one host fail together",
  purpose: "App A and App B look like two copies, but both run on the same physical machine, so one power failure takes out both.",
  limits: "One shared host stands for any shared cause: one rack, one power feed, one zone, one bad deploy pushed to both copies. The parallel formula assumes failures are independent, and a shared cause breaks that.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "lb", kind: "router", label: "Balancer", sub: "checks A and B", x: 60, y: 150 },
      { id: "a", kind: "server", label: "App A", sub: "up", x: 210, y: 90 },
      { id: "b", kind: "server", label: "App B", sub: "up", x: 210, y: 210 },
      { id: "host", kind: "server", label: "Host", sub: "runs A and B", x: 360, y: 150 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "lb", to: "a", label: "check" },
      { kind: "fly", at: 0.3, dur: 0.5, from: "lb", to: "b", label: "check" },
      { kind: "say", at: 0.8, actor: "a", text: "healthy", tone: "good" },
      { kind: "say", at: 0.8, actor: "b", text: "healthy", tone: "good" },
      { kind: "say", at: 1.6, actor: "host", text: "power lost", tone: "bad" },
      { kind: "mark", at: 1.6, actor: "host", tone: "bad" },
      { kind: "fly", at: 1.8, dur: 0.6, from: "host", to: "a", label: "no power", tone: "bad" },
      { kind: "fly", at: 1.8, dur: 0.6, from: "host", to: "b", label: "no power", tone: "bad" },
      { kind: "say", at: 2.4, actor: "a", text: "down", tone: "bad" },
      { kind: "say", at: 2.4, actor: "b", text: "down", tone: "bad" },
      { kind: "fly", at: 2.8, dur: 0.5, from: "lb", to: "a", label: "check" },
      { kind: "fly", at: 2.8, dur: 0.5, from: "lb", to: "b", label: "check" },
      { kind: "say", at: 3.4, actor: "lb", text: "no copy left", tone: "bad" },
      { kind: "mark", at: 3.4, actor: "lb", tone: "bad" },
      { kind: "verdict", at: 3.6, text: "One host fails: both copies down", tone: "bad" },
    ],
    loop: 6.8,
  },
};
