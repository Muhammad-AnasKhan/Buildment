import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.2 beat 2: A burst of six signups waits in the queue.
export const sysdesignM15SpikeAbsorbed: SceneSpec = {
  kind: "scene",
  title: "A burst of six signups waits in the queue",
  purpose: "Six signups arrive in the same second. The mailer can send one email per second. The queue holds the other five, and every email is sent.",
  limits: "One worker doing one job per second is a course number. A queue only helps when the burst is short; if work keeps coming faster than it is done, the line only grows (next beat).",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "users", label: "Signups", kind: "user", sub: "6 at once", x: 60, y: 110 },
      { id: "queue", label: "Queue", kind: "queue", sub: "empty", x: 210, y: 110 },
      { id: "worker", label: "Mailer", kind: "worker", sub: "1 per second", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "users", to: "queue", label: "6 jobs" },
      { kind: "say", at: 1.3, actor: "queue", text: "6 waiting", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.6, from: "queue", to: "worker", label: "job 1" },
      { kind: "say", at: 2.3, actor: "queue", text: "5 waiting", tone: "warn" },
      { kind: "fly", at: 2.7, dur: 0.6, from: "queue", to: "worker", label: "job 2" },
      { kind: "say", at: 3.3, actor: "queue", text: "4 waiting", tone: "warn" },
      { kind: "fly", at: 3.7, dur: 0.6, from: "queue", to: "worker", label: "job 3" },
      { kind: "say", at: 4.3, actor: "queue", text: "2 waiting", tone: "accent" },
      { kind: "fly", at: 4.7, dur: 0.6, from: "queue", to: "worker", label: "job 4" },
      { kind: "say", at: 5.3, actor: "queue", text: "0 waiting", tone: "good" },
      { kind: "say", at: 5.3, actor: "worker", text: "6 sent", tone: "good" },
      { kind: "verdict", at: 5.9, text: "Spike absorbed: nothing dropped", tone: "good" },
    ],
    loop: 8.9,
  },
};
