import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.5 beat 2: the same story with a hybrid clock. B sees a message from
// the future (100) and its own clock says 70, so it keeps 100 and adds 1 to the counter.
export const sysdesignM10HlcRule: SceneSpec = {
  kind: "scene",
  title: "The hybrid clock keeps the later time",
  purpose: "B receives the stamp (100, 0) while its own clock reads 70. It keeps the larger time, 100, and adds 1 to the counter, so the receive is stamped (100, 1), after the send.",
  limits: "A hybrid stamp is a pair (time, counter). Compare the times first, then the counters. The pair stays close to wall time but, as here, may run ahead of a slow local clock by up to the skew between clocks.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "(100, 0)", x: 70, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "clock reads 70", x: 350, y: 100 },
    ],
    strip: { y: 300, from: 60, to: 120, unit: "ms", caption: "hybrid stamp: time part", every: 20 },
    events: [
      { kind: "tag", at: 0.4, row: 0, value: 100, label: "send 100,0", tone: "accent" },
      { kind: "fly", at: 0.9, dur: 1.2, from: "a", to: "b", label: "(100, 0)" },
      { kind: "say", at: 2.1, actor: "b", text: "max(70,100)", tone: "warn" },
      { kind: "say", at: 3, actor: "b", text: "(100, 1)", tone: "good" },
      { kind: "tag", at: 3, row: 1, value: 100, label: "recv 100,1", tone: "good" },
      { kind: "verdict", at: 3.4, text: "Receive gets (100, 1): after send", tone: "good" },
    ],
    loop: 6.8,
  },
};
