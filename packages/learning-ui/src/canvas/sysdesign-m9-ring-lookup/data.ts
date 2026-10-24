import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.3 beat 1: the hash ring drawn as a line from 0 to 100 that wraps round.
// Nodes sit at hash positions A 10, B 36, C 86. A key goes to the first node
// at or after its own position, wrapping from 100 back to 0.
export const sysdesignM9RingLookup: SceneSpec = {
  kind: "scene",
  title: "A key goes to the next node on the ring",
  purpose: "Nodes and keys are hashed to positions on a ring. A key belongs to the first node at or after its position, and the ring wraps from 100 back to 0.",
  limits: "A real ring runs from 0 to 4,294,967,295 (a 32 bit hash). It is drawn here as a line from 0 to 100 that wraps round, with three nodes, so the labels stay readable.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "at 10", x: 60, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "at 36", x: 210, y: 100 },
      { id: "c", label: "Node C", kind: "server", sub: "at 86", x: 360, y: 100 },
    ],
    strip: { y: 250, from: 0, to: 100, unit: "", caption: "position on the ring (after 100 comes 0 again)", every: 20 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 10, label: "A", tone: "accent" },
      { kind: "tag", at: 0.5, row: 0, value: 36, label: "B", tone: "accent" },
      { kind: "tag", at: 0.7, row: 0, value: 86, label: "C", tone: "accent" },
      { kind: "tag", at: 1.5, row: 1, value: 24, label: "key k1" },
      { kind: "say", at: 2.0, actor: "b", text: "k1 is mine", tone: "good" },
      { kind: "mark", at: 2.0, actor: "b", tone: "good" },
      { kind: "tag", at: 2.6, row: 1, value: 60, label: "key k2" },
      { kind: "say", at: 3.1, actor: "c", text: "k2 is mine", tone: "good" },
      { kind: "tag", at: 3.7, row: 1, value: 94, label: "key k3" },
      { kind: "say", at: 4.2, actor: "a", text: "k3 wraps to me", tone: "good" },
      { kind: "mark", at: 4.2, actor: "a", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Each key goes to the next node", tone: "good" },
    ],
    loop: 7.8,
  },
};
