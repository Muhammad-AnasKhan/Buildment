import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.3 beat 4: A crashed encode job runs again on another worker and writes the same file name.
export const sysdesignM27JobRetry: SceneSpec = {
  kind: "scene",
  title: "A failed job reruns under the same name",
  purpose: "Worker A crashes in the middle of an encode job. The queue puts the job back in line after its timeout. Worker B takes it and writes the result to the same file name, so a retry leaves one file, not two.",
  limits: "One job and two workers. Queues deliver at least once, so a job can run twice even when nothing crashes; the same-name rule is what makes that harmless. After several failures a job should go to a dead letter queue, which the picture leaves out.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "queue", label: "Queue", kind: "queue", sub: "3 jobs", x: 70, y: 100 },
      { id: "a", label: "Worker A", kind: "worker", sub: "idle", x: 350, y: 100 },
      { id: "b", label: "Worker B", kind: "worker", sub: "idle", x: 350, y: 235 },
      { id: "store", label: "Storage", kind: "database", sub: "outputs", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "queue", to: "a", label: "720p chunk 7" },
      { kind: "say", at: 1.0, actor: "a", text: "encoding", tone: "accent" },
      { kind: "say", at: 1.9, actor: "a", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1.9, actor: "a", tone: "bad" },
      { kind: "say", at: 2.2, actor: "queue", text: "timeout", tone: "warn" },
      { kind: "say", at: 3.0, actor: "queue", text: "job back", tone: "warn" },
      { kind: "fly", at: 3.2, dur: 0.9, from: "queue", to: "b", label: "720p chunk 7" },
      { kind: "say", at: 4.1, actor: "b", text: "encoding", tone: "accent" },
      { kind: "fly", at: 4.4, dur: 0.9, from: "b", to: "store", label: "v81/720p/0007" },
      { kind: "say", at: 5.3, actor: "store", text: "1 file", tone: "good" },
      { kind: "say", at: 5.3, actor: "b", text: "done", tone: "good" },
      { kind: "verdict", at: 5.5, text: "Same name: a retry is safe", tone: "good" },
    ],
    loop: 8.5,
  },
};
