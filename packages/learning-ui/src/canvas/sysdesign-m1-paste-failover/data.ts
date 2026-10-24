import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 7 of 1.4: failure. App 1 crashes; the load balancer's health check
// finds it, stops sending it requests, and App 2 serves the next one.
export const sysdesignM1PasteFailover: SceneSpec = {
  kind: "scene",
  title: "Failure: one app server dies, users are still served",
  purpose: "App 1 crashes, the load balancer's health check notices, and the next request goes to App 2.",
  limits: "The health check finds the crash at once here; real checks run every few seconds, so a few requests can fail first. The database is still a single copy in this design, and if it fails, every request fails.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "browser", label: "Browser", kind: "user", sub: "reading pastes", x: 60, y: 140 },
      { id: "lb", label: "Balancer", kind: "router", sub: "health checks", x: 210, y: 140 },
      { id: "app1", label: "App 1", kind: "server", sub: "up", x: 360, y: 85 },
      { id: "app2", label: "App 2", kind: "server", sub: "up", x: 360, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.7, from: "browser", to: "lb", label: "GET aB3xY9" },
      { kind: "fly", at: 0.7, dur: 0.6, from: "lb", to: "app1", label: "to App 1" },
      { kind: "say", at: 1.3, actor: "app1", text: "served", tone: "good" },

      { kind: "say", at: 2.0, actor: "app1", text: "crashed", tone: "bad" },
      { kind: "mark", at: 2.0, actor: "app1", tone: "bad" },
      { kind: "fly", at: 2.4, dur: 0.6, from: "lb", to: "app1", label: "health check" },
      { kind: "say", at: 3.0, actor: "lb", text: "App 1 is down", tone: "warn" },

      { kind: "fly", at: 3.4, dur: 0.7, from: "browser", to: "lb", label: "GET Qp7k2M" },
      { kind: "fly", at: 4.1, dur: 0.6, from: "lb", to: "app2", label: "to App 2" },
      { kind: "say", at: 4.7, actor: "app2", text: "served", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.6, from: "app2", to: "lb", label: "paste", tone: "good" },
      { kind: "fly", at: 5.4, dur: 0.7, from: "lb", to: "browser", label: "paste", tone: "good" },
      { kind: "say", at: 6.1, actor: "browser", text: "got the paste", tone: "good" },
      { kind: "verdict", at: 6.3, text: "One app down, users still served", tone: "good" },
    ],
    loop: 9.3,
  },
};
