import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.6 beat 2: a request needs every part of a chain. Load balancer 99.99%,
// app 99.9%, database 99.9%: when the database is down, the page fails.
export const sysdesignM2ChainFails: SceneSpec = {
  kind: "scene",
  title: "A chain fails when any link fails",
  purpose: "A page needs the load balancer, the app and the database. It works while all three are up, and fails the moment one is down.",
  limits: "The availability numbers are example targets for this chapter, not measured values. Real parts can also be partly up: slow, or failing only some requests.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "user", kind: "user", label: "User", sub: "opens page", x: 60, y: 95 },
      { id: "lb", kind: "router", label: "Balancer", sub: "99.99% up", x: 210, y: 95 },
      { id: "app", kind: "server", label: "App", sub: "99.9% up", x: 360, y: 95 },
      { id: "db", kind: "database", label: "Database", sub: "99.9% up", x: 360, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "user", to: "lb", label: "page" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "lb", to: "app", label: "page" },
      { kind: "fly", at: 1.3, dur: 0.5, from: "app", to: "db", label: "query" },
      { kind: "fly", at: 1.8, dur: 0.5, from: "db", to: "app", label: "rows", tone: "good" },
      { kind: "fly", at: 2.3, dur: 0.5, from: "app", to: "lb", label: "page", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.5, from: "lb", to: "user", label: "page", tone: "good" },
      { kind: "say", at: 3.3, actor: "user", text: "page OK", tone: "good" },
      { kind: "say", at: 3.6, actor: "db", text: "down", tone: "bad" },
      { kind: "mark", at: 3.6, actor: "db", tone: "bad" },
      { kind: "say", at: 3.8, actor: "user", text: "opens page" },
      { kind: "fly", at: 3.8, dur: 0.4, from: "user", to: "lb", label: "page" },
      { kind: "fly", at: 4.2, dur: 0.4, from: "lb", to: "app", label: "page" },
      { kind: "fly", at: 4.6, dur: 0.4, from: "app", to: "db", label: "query" },
      { kind: "say", at: 5.0, actor: "app", text: "no database", tone: "bad" },
      { kind: "fly", at: 5.1, dur: 0.4, from: "app", to: "lb", label: "error", tone: "bad" },
      { kind: "fly", at: 5.5, dur: 0.4, from: "lb", to: "user", label: "error", tone: "bad" },
      { kind: "say", at: 5.9, actor: "user", text: "error page", tone: "bad" },
      { kind: "verdict", at: 6.0, text: "Any link down: the page fails", tone: "bad" },
    ],
    loop: 8.8,
  },
};
