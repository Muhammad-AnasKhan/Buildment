import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.2 beat 4 (A CPU limit slows).
export const sysdesignM18CpuThrottle: SceneSpec = {
  kind: "scene",
  title: "A CPU limit makes work slower, and nothing is killed",
  purpose: "The same request needs 200 ms of CPU. With a whole CPU it takes 200 ms. With half a CPU it takes about twice as long.",
  limits: "Measured on Docker Desktop with --cpus=0.5: 213 ms with no limit and 406 ms with the limit. The kernel lets the container run for a share of each short time slice, then pauses it until the next slice. The request itself was one thread of pure CPU work.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "client", label: "Client", kind: "user", x: 60, y: 130 },
      { id: "full", label: "Full CPU", kind: "server", sub: "no limit", x: 360, y: 90 },
      { id: "half", label: "Half CPU", kind: "server", sub: "cpus 0.5", x: 360, y: 170 },
    ],
    strip: { y: 266, from: 0, to: 400, unit: " ms", caption: "time to finish one request", every: 100 },
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "client", to: "full", label: "200 ms work" },
      { kind: "fly", at: 0.4, dur: 0.8, from: "client", to: "half", label: "200 ms work" },
      { kind: "say", at: 1.3, actor: "full", text: "working", tone: "good" },
      { kind: "say", at: 1.3, actor: "half", text: "throttled", tone: "warn" },
      { kind: "fly", at: 1.9, dur: 0.7, from: "full", to: "client", label: "done", tone: "good" },
      { kind: "tag", at: 2.6, row: 0, value: 200, label: "full: 200 ms", tone: "good" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "half", to: "client", label: "done", tone: "warn" },
      { kind: "tag", at: 3.9, row: 1, value: 400, label: "half: 400 ms", tone: "warn" },
      { kind: "verdict", at: 4.2, text: "CPU limit: slower, never killed", tone: "warn" },
    ],
    loop: 7.2,
  },
};
