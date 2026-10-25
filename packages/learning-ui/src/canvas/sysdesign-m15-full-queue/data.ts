import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.2 beat 5: A full queue pushes back on the sender.
export const sysdesignM15FullQueue: SceneSpec = {
  kind: "scene",
  title: "A full queue pushes back on the sender",
  purpose: "The queue holds at most 5 jobs and the mailer is slow. When the API offers a sixth job, the queue says it is full, and the API has to wait.",
  limits: "A limit of 5 is for the picture; real queues hold thousands or millions. Pushing back is one choice. The sender could also drop the job or store it elsewhere.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "api", label: "API", kind: "server", sub: "has job 6", x: 60, y: 110 },
      { id: "queue", label: "Queue", kind: "queue", sub: "5 of 5 full", x: 210, y: 110 },
      { id: "worker", label: "Mailer", kind: "worker", sub: "slow", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.9, from: "api", to: "queue", label: "job 6" },
      { kind: "fly", at: 1.8, dur: 0.9, from: "queue", to: "api", label: "full: wait", tone: "warn" },
      { kind: "say", at: 2.8, actor: "api", text: "waits", tone: "warn" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "queue", to: "worker", label: "job 1" },
      { kind: "say", at: 4.1, actor: "queue", text: "4 of 5", tone: "good" },
      { kind: "fly", at: 4.4, dur: 0.9, from: "api", to: "queue", label: "job 6 again" },
      { kind: "say", at: 5.4, actor: "queue", text: "5 of 5 full", tone: "warn" },
      { kind: "say", at: 5.4, actor: "api", text: "sent", tone: "good" },
      { kind: "verdict", at: 5.8, text: "The sender waits; nothing is lost", tone: "good" },
    ],
    loop: 8.8,
  },
};
