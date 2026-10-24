import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.5: round robin with uneven work. Every third request is a slow export, and
// taking turns sends each one to the same server, A.
export const sysdesignM4RoundRobinBlind: SceneSpec = {
  kind: "scene",
  title: "Round robin keeps feeding the busy server",
  purpose: "Requests take turns: A, B, C, A, B, C. Every third request is a 2-second export, so every export lands on A, which builds a line while B and C sit idle.",
  limits: "The exports arrive exactly every third request, which makes round robin as unlucky as it can be. With random arrivals the effect is weaker but real: round robin never looks at how busy a server is.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "lb", label: "Balancer", kind: "router", sub: "round robin", x: 62, y: 170 },
      { id: "a", label: "A", kind: "server", sub: "idle", x: 358, y: 90 },
      { id: "b", label: "B", kind: "server", sub: "idle", x: 358, y: 170 },
      { id: "c", label: "C", kind: "server", sub: "idle", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "lb", to: "a", label: "export" },
      { kind: "say", at: 0.8, actor: "a", text: "busy for 2 s", tone: "warn" },
      { kind: "fly", at: 0.7, dur: 0.6, from: "lb", to: "b", label: "page" },
      { kind: "say", at: 1.3, actor: "b", text: "done", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.6, from: "lb", to: "c", label: "page" },
      { kind: "say", at: 1.8, actor: "c", text: "done", tone: "good" },
      { kind: "fly", at: 1.9, dur: 0.6, from: "lb", to: "a", label: "export" },
      { kind: "say", at: 2.5, actor: "a", text: "1 waiting", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.6, from: "lb", to: "b", label: "page" },
      { kind: "fly", at: 2.9, dur: 0.6, from: "lb", to: "c", label: "page" },
      { kind: "fly", at: 3.6, dur: 0.6, from: "lb", to: "a", label: "export" },
      { kind: "say", at: 4.2, actor: "a", text: "2 waiting", tone: "bad" },
      { kind: "mark", at: 4.2, actor: "a", tone: "bad" },
      { kind: "fly", at: 4.1, dur: 0.6, from: "lb", to: "b", label: "page" },
      { kind: "fly", at: 4.6, dur: 0.6, from: "lb", to: "c", label: "page" },
      { kind: "say", at: 5.2, actor: "b", text: "idle" },
      { kind: "say", at: 5.2, actor: "c", text: "idle" },
      { kind: "verdict", at: 5.4, text: "Round robin kept feeding busy A", tone: "bad" },
    ],
    loop: 8.4,
  },
};
