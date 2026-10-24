import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.5 beat 3: a leaky bucket that drains 1 request a second and queues at
// most 3. Of 7 at once: 1 now, 3 wait their turn, 3 are refused.
export const sysdesignM6LeakyBucket: SceneSpec = {
  kind: "scene",
  title: "Leaky bucket: a steady drip out",
  purpose: "Seven requests arrive at once; one goes through, three wait in the queue and leave one a second, and three are refused because the queue is full.",
  limits: "The rate of 1 a second and the queue of 3 are made-up settings, and time is sped up. nginx calls the queue size 'burst'.",
  scene: {
    width: 420,
    height: 220,
    actors: [
      { id: "client", label: "Client", kind: "worker", sub: "7 at once", x: 60, y: 140 },
      { id: "queue", label: "Queue", kind: "queue", sub: "holds 3", x: 210, y: 140 },
      { id: "api", label: "Search API", kind: "server", sub: "1 a second", x: 360, y: 140 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "client", to: "queue", label: "7 requests" },
      { kind: "say", at: 0.9, actor: "queue", text: "3 waiting", tone: "warn" },
      { kind: "fly", at: 1.0, dur: 0.6, from: "queue", to: "api", label: "1st now" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "queue", to: "client", label: "3 refused", tone: "bad" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "queue", to: "api", label: "2nd" },
      { kind: "say", at: 2.0, actor: "queue", text: "2 waiting", tone: "warn" },
      { kind: "fly", at: 3.0, dur: 0.6, from: "queue", to: "api", label: "3rd" },
      { kind: "say", at: 3.0, actor: "queue", text: "1 waiting", tone: "warn" },
      { kind: "fly", at: 4.0, dur: 0.6, from: "queue", to: "api", label: "4th" },
      { kind: "say", at: 4.0, actor: "queue", text: "empty" },
      { kind: "say", at: 4.6, actor: "api", text: "steady 1 a sec", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Smooth flow out; extras wait or fail", tone: "accent" },
    ],
    loop: 7.8,
  },
};
