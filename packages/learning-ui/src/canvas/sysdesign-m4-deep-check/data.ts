import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.4: a deep health check also pings the database. When the database is slow,
// every server fails its check at once, and the balancer has nobody left, so
// it fails open.
export const sysdesignM4DeepCheck: SceneSpec = {
  kind: "scene",
  title: "A slow database fails every health check",
  purpose: "Each server's health check also asks the database. The database slows down, every check times out together, and the balancer would remove the whole fleet. It fails open instead.",
  limits: "Two servers stand for the whole fleet. Failing open keeps the app up only if the servers can still serve something; here they can, slowly, because the database is slow, not dead.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "lb", label: "Balancer", kind: "router", sub: "deep checks", x: 62, y: 170 },
      { id: "app1", label: "App 1", kind: "server", sub: "healthy", x: 210, y: 90 },
      { id: "app2", label: "App 2", kind: "server", sub: "healthy", x: 210, y: 250 },
      { id: "db", label: "Database", kind: "database", sub: "fast", x: 358, y: 170 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "lb", to: "app1", label: "health?" },
      { kind: "fly", at: 0.2, dur: 0.5, from: "lb", to: "app2", label: "health?" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "app1", to: "db", label: "ping" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "app2", to: "db", label: "ping" },
      { kind: "fly", at: 1.2, dur: 0.5, from: "db", to: "app1", label: "ok", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.5, from: "db", to: "app2", label: "ok", tone: "good" },
      { kind: "say", at: 1.7, actor: "app1", text: "check passed", tone: "good" },
      { kind: "say", at: 1.7, actor: "app2", text: "check passed", tone: "good" },
      { kind: "say", at: 2.3, actor: "db", text: "slow: 3 s", tone: "bad" },
      { kind: "mark", at: 2.3, actor: "db", tone: "warn" },
      { kind: "fly", at: 2.7, dur: 0.5, from: "lb", to: "app1", label: "health?" },
      { kind: "fly", at: 2.7, dur: 0.5, from: "lb", to: "app2", label: "health?" },
      { kind: "fly", at: 3.2, dur: 0.5, from: "app1", to: "db", label: "ping" },
      { kind: "fly", at: 3.2, dur: 0.5, from: "app2", to: "db", label: "ping" },
      { kind: "say", at: 3.9, actor: "app1", text: "check timed out", tone: "bad" },
      { kind: "say", at: 3.9, actor: "app2", text: "check timed out", tone: "bad" },
      { kind: "mark", at: 3.9, actor: "app1", tone: "bad" },
      { kind: "mark", at: 3.9, actor: "app2", tone: "bad" },
      { kind: "say", at: 4.3, actor: "lb", text: "0 healthy", tone: "bad" },
      { kind: "say", at: 4.9, actor: "lb", text: "fail open: all", tone: "warn" },
      { kind: "verdict", at: 5.1, text: "One slow database failed every server", tone: "bad" },
    ],
    loop: 8.1,
  },
};
