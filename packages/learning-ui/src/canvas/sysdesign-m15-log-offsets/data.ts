import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.3 beat 2: A log keeps its events; each reader keeps a place.
export const sysdesignM15LogOffsets: SceneSpec = {
  kind: "scene",
  title: "A log keeps its events; each reader keeps a place",
  purpose: "The log holds events 1 to 6. The email reader is at 4 and the stats reader is at 2. Each reads on from its own place and the log deletes nothing.",
  limits: "Two readers and one log. A real log such as Kafka is split into partitions, and each partition has its own numbers (next beats).",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "log", label: "Log", kind: "queue", sub: "events 1 to 6", x: 210, y: 100 },
      { id: "email", label: "Email", kind: "worker", sub: "at 4", x: 60, y: 220 },
      { id: "stats", label: "Stats", kind: "worker", sub: "at 2", x: 360, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.5, dur: 0.9, from: "log", to: "email", label: "event 5" },
      { kind: "say", at: 1.6, actor: "email", text: "at 5", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "log", to: "stats", label: "event 3" },
      { kind: "say", at: 3.3, actor: "stats", text: "at 3", tone: "good" },
      { kind: "say", at: 3.7, actor: "log", text: "still 1 to 6", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Two readers, two places, nothing gone", tone: "good" },
    ],
    loop: 7.6,
  },
};
