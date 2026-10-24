import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.4 beat 5: The click is counted after the redirect, through a queue.
export const sysdesignM20ClickQueue: SceneSpec = {
  kind: "scene",
  title: "Count the click after the redirect, not before",
  purpose: "The redirect service answers the phone at once and drops a click event in a queue. A counter worker adds it up later, so a slow counter cannot slow a redirect.",
  limits: "One queue and one worker. Queues deliver at least once, so a count can be a little high after a retry, and events that never reach the queue are lost. That is fine for click counts, not for billing.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "taps the link", x: 70, y: 100 },
      { id: "svc", label: "Redirect", kind: "server", sub: "GET /aB3x9Kp", x: 350, y: 100 },
      { id: "queue", label: "Queue", kind: "queue", sub: "empty", x: 350, y: 235 },
      { id: "worker", label: "Counter", kind: "worker", sub: "idle", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "svc", label: "GET /aB3x9Kp" },
      { kind: "say", at: 1.0, actor: "svc", text: "302 in 0.55 ms", tone: "good" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "svc", to: "phone", label: "302 + URL" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "svc", to: "queue", label: "click event" },
      { kind: "say", at: 1.9, actor: "phone", text: "redirected", tone: "good" },
      { kind: "say", at: 1.9, actor: "queue", text: "1 waiting", tone: "accent" },
      { kind: "fly", at: 2.8, dur: 0.9, from: "queue", to: "worker", label: "click event" },
      { kind: "say", at: 3.7, actor: "queue", text: "empty", tone: "good" },
      { kind: "say", at: 3.7, actor: "worker", text: "count + 1", tone: "good" },
      { kind: "verdict", at: 3.9, text: "Count later, redirect now", tone: "good" },
    ],
    loop: 7,
  },
};
