import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.2 beat 1: The API drops a job in a queue and answers at once.
export const sysdesignM15QueueDecouples: SceneSpec = {
  kind: "scene",
  title: "The API drops a job in a queue and answers at once",
  purpose: "The API saves Layla's account, puts a send-email job in a queue and replies in 40 ms. A worker sends the email later, and the 3 seconds are nobody's wait.",
  limits: "One queue and one worker. Real queues hold many jobs and many workers; the next beats add those. The 40 ms and 3 s are course numbers.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "Create account", x: 60, y: 100 },
      { id: "api", label: "API", kind: "server", sub: "saves account", x: 210, y: 100 },
      { id: "queue", label: "Queue", kind: "queue", sub: "empty", x: 360, y: 100 },
      { id: "worker", label: "Mailer", kind: "worker", sub: "idle", x: 360, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "layla", to: "api", label: "sign up" },
      { kind: "say", at: 1.1, actor: "api", text: "saved: 40 ms", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "api", to: "queue", label: "email job" },
      { kind: "say", at: 2.1, actor: "queue", text: "1 waiting", tone: "accent" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "api", to: "layla", label: "done", tone: "good" },
      { kind: "say", at: 3.2, actor: "layla", text: "done in 40 ms", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "queue", to: "worker", label: "job" },
      { kind: "say", at: 4.4, actor: "queue", text: "empty", tone: "good" },
      { kind: "say", at: 4.4, actor: "worker", text: "sending: 3 s", tone: "warn" },
      { kind: "verdict", at: 5.2, text: "Done in 40 ms; email sent later", tone: "good" },
    ],
    loop: 8.4,
  },
};
