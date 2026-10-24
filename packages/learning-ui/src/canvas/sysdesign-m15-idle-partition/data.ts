import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.6 beat 6: A silent partition stops the watermark.
export const sysdesignM15IdlePartition: SceneSpec = {
  kind: "scene",
  title: "A silent partition stops the watermark",
  purpose: "Partition 0 sends events up to time 200, but partition 1 has been silent since time 60. The counter's watermark is the smaller of the two, so it stays at 60 and no window after it can close.",
  limits: "Two partitions. Stream engines let you mark an input idle after a timeout so it stops holding the watermark back; the timeout is a trade-off.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "p0", label: "Part. 0", kind: "queue", sub: "busy", x: 60, y: 100 },
      { id: "p1", label: "Part. 1", kind: "queue", sub: "busy", x: 360, y: 100 },
      { id: "counter", label: "Counter", kind: "server", sub: "watermark: -", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "p0", to: "counter", label: "event 60" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "p1", to: "counter", label: "event 60" },
      { kind: "say", at: 1.3, actor: "counter", text: "watermark 60", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 0.8, from: "p0", to: "counter", label: "event 200" },
      { kind: "say", at: 2.6, actor: "p1", text: "silent", tone: "warn" },
      { kind: "say", at: 2.8, actor: "counter", text: "min(200, 60)", tone: "warn" },
      { kind: "say", at: 3.8, actor: "counter", text: "stuck at 60", tone: "bad" },
      { kind: "mark", at: 3.8, actor: "counter", tone: "bad" },
      { kind: "verdict", at: 4.6, text: "One silent input holds the watermark", tone: "bad" },
    ],
    loop: 7.6,
  },
};
