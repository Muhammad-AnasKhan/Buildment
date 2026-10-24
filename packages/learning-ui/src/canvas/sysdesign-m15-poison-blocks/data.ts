import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.5 beat 1: A message that always fails blocks the partition.
export const sysdesignM15PoisonBlocks: SceneSpec = {
  kind: "scene",
  title: "A message that always fails blocks the partition",
  purpose: "The consumer reads m1 and succeeds. Message m2 has a bad address and fails. The consumer must keep order, so it retries m2 and m3 and m4 wait.",
  limits: "One partition and one consumer, the usual way to keep order. The 1 second retry is a course number.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "line", label: "Partition", kind: "queue", sub: "m1 m2 m3 m4", x: 60, y: 110 },
      { id: "cons", label: "Consumer", kind: "worker", sub: "idle", x: 210, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.7, from: "line", to: "cons", label: "m1" },
      { kind: "say", at: 1.2, actor: "cons", text: "m1 ok", tone: "good" },
      { kind: "fly", at: 1.8, dur: 0.7, from: "line", to: "cons", label: "m2" },
      { kind: "say", at: 2.6, actor: "cons", text: "m2 fails", tone: "bad" },
      { kind: "wait", at: 3, dur: 1.4, actor: "cons", label: "retry {n} s", doneLabel: "fails again", total: 1 },
      { kind: "say", at: 4.6, actor: "line", text: "m3, m4 stuck", tone: "warn" },
      { kind: "mark", at: 4.6, actor: "cons", tone: "bad" },
      { kind: "verdict", at: 5.2, text: "One bad message stops the line", tone: "bad" },
    ],
    loop: 8.2,
  },
};
