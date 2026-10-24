import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.3 beat 4: a smaller Lamport number does not mean earlier or causal.
// A wrote at 5 and C wrote at 3 without any message between them.
export const sysdesignM10LamportNoCause: SceneSpec = {
  kind: "scene",
  title: "3 is less than 5, but neither caused the other",
  purpose: "Two nodes edit the same note and never exchange a message. Their counters are 5 and 3, which looks like an order, but there is none.",
  limits: "Only the direction 'cause means smaller number' is guaranteed. The reverse is not. With no messages, the counters of two nodes mean nothing to each other. Chapter 10.4 adds the tool that can tell the two cases apart.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "5 events", x: 90, y: 100 },
      { id: "c", label: "Node C", kind: "server", sub: "3 events", x: 330, y: 100 },
    ],
    strip: { y: 250, from: 0, to: 6, unit: "", caption: "Lamport counter", every: 1 },
    events: [
      { kind: "say", at: 0.5, actor: "a", text: "no messages", tone: "accent" },
      { kind: "say", at: 0.5, actor: "c", text: "no messages", tone: "accent" },
      { kind: "say", at: 1.5, actor: "a", text: "wrote at 5" },
      { kind: "tag", at: 1.5, row: 0, value: 5, label: "A wrote 5" },
      { kind: "say", at: 2.3, actor: "c", text: "wrote at 3" },
      { kind: "tag", at: 2.3, row: 1, value: 3, label: "C wrote 3" },
      { kind: "mark", at: 3.2, actor: "a", tone: "warn" },
      { kind: "mark", at: 3.2, actor: "c", tone: "warn" },
      { kind: "verdict", at: 3.4, text: "3 < 5, but neither caused the other", tone: "bad" },
    ],
    loop: 7,
  },
};
