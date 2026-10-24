import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.3: Hana logs in on App 1, which keeps her session in its own memory. Round
// robin sends her next request to App 2, which has never heard of her.
export const sysdesignM4SessionLost: SceneSpec = {
  kind: "scene",
  title: "Logged in on App 1, a stranger on App 2",
  purpose: "The session is saved in App 1's memory. The next request goes to App 2, which has no session for Hana, so she sees the log-in page again.",
  limits: "Round robin sends requests strictly in turn, so the second request is sure to land on App 2; with random choice it happens about half the time with two servers. The cookie here holds only a session id; the session data stays on App 1.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "logging in", x: 62, y: 150 },
      { id: "lb", label: "Balancer", kind: "router", sub: "round robin", x: 210, y: 150 },
      { id: "app1", label: "App 1", kind: "server", sub: "no sessions", x: 358, y: 95 },
      { id: "app2", label: "App 2", kind: "server", sub: "no sessions", x: 358, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "hana", to: "lb", label: "log in" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "lb", to: "app1", label: "log in" },
      { kind: "say", at: 1.4, actor: "app1", text: "session: Hana", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.6, from: "app1", to: "lb", label: "cookie", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.6, from: "lb", to: "hana", label: "cookie", tone: "good" },
      { kind: "say", at: 2.8, actor: "hana", text: "logged in", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.6, from: "hana", to: "lb", label: "my notes" },
      { kind: "fly", at: 4, dur: 0.6, from: "lb", to: "app2", label: "my notes" },
      { kind: "say", at: 4.6, actor: "app2", text: "who is this?", tone: "bad" },
      { kind: "mark", at: 4.6, actor: "app2", tone: "bad" },
      { kind: "fly", at: 4.8, dur: 0.6, from: "app2", to: "lb", label: "log in page", tone: "bad" },
      { kind: "fly", at: 5.4, dur: 0.6, from: "lb", to: "hana", label: "log in page", tone: "bad" },
      { kind: "say", at: 6, actor: "hana", text: "logged out?!", tone: "bad" },
      { kind: "verdict", at: 6.2, text: "Her session lives only on App 1", tone: "bad" },
    ],
    loop: 9.2,
  },
};
