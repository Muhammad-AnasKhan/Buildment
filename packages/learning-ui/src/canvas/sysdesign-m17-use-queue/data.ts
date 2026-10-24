import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.5 beat 2 (Busy 60%, yet tasks wait).
export const sysdesignM17UseQueue: SceneSpec = {
  kind: "scene",
  title: "A server that is 60% busy on average can still have a queue of waiting tasks",
  purpose: "Utilization is an average over time. Work arrives in bursts, so for a few seconds more tasks arrive than the server can start. The waiting tasks are the saturation, and only the queue length shows them.",
  limits: "One server and two bursts. 60% busy and 12 waiting are course numbers. A real run queue is read from the operating system, and the right alert level depends on the number of cores.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "traffic", label: "Traffic", kind: "user", sub: "in bursts", x: 60, y: 100 },
      { id: "server", label: "Server", kind: "server", sub: "60% busy", x: 360, y: 100 },
      { id: "queue", label: "Run queue", kind: "queue", sub: "0 waiting", x: 210, y: 220 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "server", text: "60% busy", tone: "accent" },
      { kind: "fly", at: 0.5, dur: 1.1, from: "traffic", to: "queue", label: "burst", tone: "warn" },
      { kind: "say", at: 1.6, actor: "queue", text: "5 waiting", tone: "warn" },
      { kind: "fly", at: 2, dur: 1.1, from: "traffic", to: "queue", label: "burst", tone: "warn" },
      { kind: "say", at: 3.1, actor: "queue", text: "12 waiting", tone: "bad" },
      { kind: "fly", at: 3.5, dur: 1.3, from: "queue", to: "server", label: "one by one" },
      { kind: "mark", at: 4.8, actor: "queue", tone: "bad" },
      { kind: "verdict", at: 5.2, text: "60% busy, yet 12 tasks wait", tone: "bad" },
    ],
    loop: 8.5,
  },
};
