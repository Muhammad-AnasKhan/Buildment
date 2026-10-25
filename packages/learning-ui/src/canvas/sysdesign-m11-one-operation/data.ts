import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.2 beat 2 ("Start, end, and one instant inside"). An operation has a start and an end, and its effect lands at one instant in between.
export const sysdesignM11OneOperation: SceneSpec = {
  kind: "scene",
  title: "One write: it starts, it ends, it lands in between",
  purpose: "Ada sends a write at time 10 and gets the answer at time 40. The store applies it at some instant between the two, and Ada cannot see which.",
  limits: "Times are made-up milliseconds. The picture shows one write and one store; a real system has many clients, and the instant is a model, not something a machine records.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "ada", label: "Ada", kind: "phone", sub: "writes x = 5", x: 80, y: 120 },
      { id: "store", label: "Store", kind: "database", sub: "x = 0", x: 340, y: 120 },
    ],
    strip: { y: 285, from: 0, to: 50, unit: "ms", caption: "time", every: 10 },
    events: [
      { kind: "tag", at: 0.4, row: 0, value: 10, label: "starts 10" },
      { kind: "fly", at: 0.6, dur: 1.2, from: "ada", to: "store", label: "write 5" },
      { kind: "say", at: 1.8, actor: "store", text: "x = 5", tone: "good" },
      { kind: "tag", at: 1.8, row: 1, value: 27, label: "effect lands here", tone: "good" },
      { kind: "fly", at: 2.2, dur: 1.2, from: "store", to: "ada", label: "ok" },
      { kind: "tag", at: 3.4, row: 0, value: 40, label: "ends 40" },
      { kind: "say", at: 3.4, actor: "ada", text: "done", tone: "good" },
      { kind: "verdict", at: 3.7, text: "It takes effect between 10 and 40", tone: "good" },
    ],
    loop: 7,
  },
};
