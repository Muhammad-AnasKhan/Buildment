import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.3 beat 4 (One star post is 20 million writes)
export const sysdesignM21StarPost: SceneSpec = {
  kind: "scene",
  title: "One star post holds up the fan-out line",
  purpose: "Karim has 20 million followers. His one post becomes 20 million timeline writes in the fan-out queue. At the planned 150,000 writes a second that is about 133 seconds of work, and Dina's post, sent a minute later, waits behind it.",
  limits: "Course numbers: a fan-out fleet planned for 150,000 timeline writes a second, one shared queue. A real system can use separate queues for big accounts, which is one of the fixes the chapter shows.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "karim", label: "Karim", kind: "phone", sub: "20M followers", x: 70, y: 100 },
      { id: "queue", label: "Fan-out line", kind: "queue", sub: "empty", x: 350, y: 100 },
      { id: "workers", label: "Workers", kind: "worker", sub: "idle", x: 350, y: 235 },
      { id: "dina", label: "Dina", kind: "phone", sub: "100 followers", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "karim", to: "queue", label: "1 post" },
      { kind: "say", at: 1, actor: "queue", text: "20M writes", tone: "bad" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "queue", to: "workers", label: "20M writes", tone: "warn" },
      { kind: "say", at: 2, actor: "workers", text: "133 s of work", tone: "bad" },
      { kind: "mark", at: 2, actor: "workers", tone: "bad" },
      { kind: "fly", at: 3, dur: 0.8, from: "dina", to: "queue", label: "her post" },
      { kind: "say", at: 3.8, actor: "queue", text: "Dina waits", tone: "warn" },
      { kind: "say", at: 3.8, actor: "dina", text: "not shown yet", tone: "bad" },
      { kind: "verdict", at: 4, text: "One star post blocks everyone's posts", tone: "bad" },
    ],
    loop: 7.5,
  },
};
