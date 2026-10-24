import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.3: sticky sessions. A cookie pins Hana to App 1, which works until App 1
// crashes; then she lands on App 2 and is logged out.
export const sysdesignM4StickyPin: SceneSpec = {
  kind: "scene",
  title: "Sticky works until her server dies",
  purpose: "A cookie tells the balancer to send Hana to App 1 every time. That fixes the lost session, until App 1 crashes and her session dies with it.",
  limits: "The pin is a cookie the balancer reads (\"app=1\"); some balancers pin by the client's address instead. The crash is sudden; a planned restart or scaling in loses the same sessions unless the server is drained first.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "app=1 cookie", x: 62, y: 150 },
      { id: "lb", label: "Balancer", kind: "router", sub: "sticky", x: 210, y: 150 },
      { id: "app1", label: "App 1", kind: "server", sub: "session: Hana", x: 358, y: 95 },
      { id: "app2", label: "App 2", kind: "server", sub: "no sessions", x: 358, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "hana", to: "lb", label: "notes, app=1" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "lb", to: "app1", label: "notes" },
      { kind: "say", at: 1.4, actor: "app1", text: "Hana: served", tone: "good" },
      { kind: "fly", at: 1.7, dur: 0.6, from: "hana", to: "lb", label: "notes, app=1" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "lb", to: "app1", label: "notes" },
      { kind: "say", at: 2.9, actor: "app1", text: "Hana again", tone: "good" },
      { kind: "say", at: 3.5, actor: "app1", text: "crashed", tone: "bad" },
      { kind: "mark", at: 3.5, actor: "app1", tone: "bad" },
      { kind: "fly", at: 3.9, dur: 0.6, from: "hana", to: "lb", label: "notes, app=1" },
      { kind: "say", at: 4.5, actor: "lb", text: "App 1 is gone", tone: "warn" },
      { kind: "fly", at: 4.7, dur: 0.6, from: "lb", to: "app2", label: "notes" },
      { kind: "say", at: 5.3, actor: "app2", text: "who is this?", tone: "bad" },
      { kind: "fly", at: 5.5, dur: 0.5, from: "app2", to: "lb", label: "log in page", tone: "bad" },
      { kind: "fly", at: 6, dur: 0.5, from: "lb", to: "hana", label: "log in page", tone: "bad" },
      { kind: "say", at: 6.5, actor: "hana", text: "logged out", tone: "bad" },
      { kind: "verdict", at: 6.7, text: "Sticky works until her server dies", tone: "bad" },
    ],
    loop: 9.7,
  },
};
