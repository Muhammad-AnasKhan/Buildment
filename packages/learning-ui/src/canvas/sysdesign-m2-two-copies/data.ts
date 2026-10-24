import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.6 beat 4: two app copies behind a load balancer. App A fails its health
// check; the load balancer sends the next page to App B, and the user is fine.
export const sysdesignM2TwoCopies: SceneSpec = {
  kind: "scene",
  title: "Two copies: one fails, the other serves",
  purpose: "The load balancer checks both app copies. When App A goes down, it sends traffic only to App B.",
  limits: "Assumes the load balancer notices the failure at once. In practice health checks run every few seconds, so a few requests can still reach the dead copy and fail or retry.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "user", kind: "user", label: "User", sub: "opens page", x: 60, y: 150 },
      { id: "lb", kind: "router", label: "Balancer", sub: "checks A and B", x: 210, y: 150 },
      { id: "a", kind: "server", label: "App A", sub: "99.9% up", x: 360, y: 90 },
      { id: "b", kind: "server", label: "App B", sub: "99.9% up", x: 360, y: 210 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "user", to: "lb", label: "page" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "lb", to: "a", label: "page" },
      { kind: "fly", at: 1.3, dur: 0.5, from: "a", to: "lb", label: "ok", tone: "good" },
      { kind: "fly", at: 1.8, dur: 0.5, from: "lb", to: "user", label: "page", tone: "good" },
      { kind: "say", at: 2.5, actor: "a", text: "down", tone: "bad" },
      { kind: "mark", at: 2.5, actor: "a", tone: "bad" },
      { kind: "say", at: 2.8, actor: "lb", text: "A failed check", tone: "warn" },
      { kind: "fly", at: 3.1, dur: 0.5, from: "user", to: "lb", label: "page" },
      { kind: "fly", at: 3.6, dur: 0.5, from: "lb", to: "b", label: "page" },
      { kind: "fly", at: 4.1, dur: 0.5, from: "b", to: "lb", label: "ok", tone: "good" },
      { kind: "fly", at: 4.6, dur: 0.5, from: "lb", to: "user", label: "page", tone: "good" },
      { kind: "say", at: 5.1, actor: "user", text: "still works", tone: "good" },
      { kind: "verdict", at: 5.2, text: "One copy down: still serving", tone: "good" },
    ],
    loop: 8,
  },
};
