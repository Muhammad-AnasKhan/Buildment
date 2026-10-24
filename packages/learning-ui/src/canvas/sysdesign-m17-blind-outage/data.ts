import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.1 beat 1 (Slow, and nobody can say where).
export const sysdesignM17BlindOutage: SceneSpec = {
  kind: "scene",
  title: "Customers say the app is slow, and the team has nothing to look at",
  purpose: "Customers write to support. The on-call team checks the one dashboard (CPU looks fine) and searches the log files of three servers, and still cannot say which part is slow.",
  limits: "Souq Express is a made-up delivery app. 112 messages, 35% CPU and 9,400 lines are course numbers. A real team would have more tools, which is what this module adds.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "customers", label: "Customers", kind: "phone", sub: "app is slow", x: 60, y: 100 },
      { id: "support", label: "Support", kind: "user", sub: "112 messages", x: 360, y: 100 },
      { id: "team", label: "On-call team", kind: "user", sub: "on call", x: 210, y: 185 },
      { id: "dash", label: "Dashboard", kind: "note", sub: "one CPU graph", x: 60, y: 270 },
      { id: "logs", label: "Log files", kind: "note", sub: "3 servers", x: 360, y: 270 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.4, from: "customers", to: "support", label: "slow!" },
      { kind: "say", at: 1.7, actor: "support", text: "112 messages", tone: "warn" },
      { kind: "say", at: 1.9, actor: "customers", text: "still slow", tone: "warn" },
      { kind: "fly", at: 2.3, dur: 1.4, from: "support", to: "team", label: "please fix" },
      { kind: "say", at: 3.7, actor: "team", text: "where to look?", tone: "accent" },
      { kind: "fly", at: 4, dur: 1.3, from: "team", to: "dash", label: "check" },
      { kind: "say", at: 5.3, actor: "dash", text: "CPU 35%: fine", tone: "good" },
      { kind: "fly", at: 5.6, dur: 1.3, from: "team", to: "logs", label: "search" },
      { kind: "say", at: 6.9, actor: "logs", text: "9,400 lines", tone: "warn" },
      { kind: "say", at: 7.3, actor: "team", text: "no clue", tone: "bad" },
      { kind: "mark", at: 7.3, actor: "team", tone: "bad" },
      { kind: "verdict", at: 8, text: "Slow, and nobody can say where", tone: "bad" },
    ],
    loop: 11.5,
  },
};
