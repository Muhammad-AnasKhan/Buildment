import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.4: health checks every 10 seconds, out after 3 failures. App 2 crashes;
// requests to it fail until the third failed check, about 30 seconds later.
export const sysdesignM4HealthCheck: SceneSpec = {
  kind: "scene",
  title: "Three failed checks, then App 2 is out",
  purpose: "The balancer checks every server every 10 seconds. App 2 crashes. Requests sent to it fail until the third failed check removes it, then the other two share its work.",
  limits: "Interval 10 seconds and 3 failures are example settings, not any product's defaults. The 30 seconds is the worst case; a crash just before a check is found sooner. Time is sped up about ten times.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "lb", label: "Balancer", kind: "router", sub: "checks: 10 s", x: 62, y: 170 },
      { id: "app1", label: "App 1", kind: "server", sub: "33% busy", x: 358, y: 90 },
      { id: "app2", label: "App 2", kind: "server", sub: "33% busy", x: 358, y: 170 },
      { id: "app3", label: "App 3", kind: "server", sub: "33% busy", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "lb", to: "app1", label: "request" },
      { kind: "fly", at: 0.6, dur: 0.5, from: "lb", to: "app2", label: "request" },
      { kind: "fly", at: 1, dur: 0.5, from: "lb", to: "app3", label: "request" },
      { kind: "say", at: 1.6, actor: "app2", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1.6, actor: "app2", tone: "bad" },
      { kind: "wait", at: 1.8, dur: 3, actor: "lb", label: "down {n} s", doneLabel: "out at 30 s", total: 30 },
      { kind: "fly", at: 2, dur: 0.5, from: "lb", to: "app2", label: "check 1" },
      { kind: "say", at: 2.5, actor: "lb", text: "1 failed check", tone: "warn" },
      { kind: "fly", at: 2.8, dur: 0.5, from: "lb", to: "app2", label: "request", tone: "bad" },
      { kind: "say", at: 3.3, actor: "app2", text: "request lost", tone: "bad" },
      { kind: "fly", at: 3.4, dur: 0.5, from: "lb", to: "app2", label: "check 2" },
      { kind: "say", at: 3.9, actor: "lb", text: "2 failed checks", tone: "warn" },
      { kind: "fly", at: 4.3, dur: 0.5, from: "lb", to: "app2", label: "check 3" },
      { kind: "say", at: 4.8, actor: "lb", text: "App 2 is out", tone: "bad" },
      { kind: "fly", at: 5, dur: 0.5, from: "lb", to: "app1", label: "request" },
      { kind: "fly", at: 5.2, dur: 0.5, from: "lb", to: "app3", label: "request" },
      { kind: "say", at: 5.6, actor: "app1", text: "50% busy", tone: "warn" },
      { kind: "say", at: 5.8, actor: "app3", text: "50% busy", tone: "warn" },
      { kind: "verdict", at: 6, text: "3 failed checks: App 2 taken out", tone: "warn" },
    ],
    loop: 9,
  },
};
