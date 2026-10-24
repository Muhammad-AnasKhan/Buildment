import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.3 beat 1: With two usual nodes down, a strict write is refused.
export const sysdesignM13StrictFails: SceneSpec = {
  kind: "scene",
  title: "With two usual nodes down, a strict write is refused",
  purpose: "The key lives on A, B and C and needs 2 confirmations. B and C are down. Only A answers, so the write fails even though other healthy nodes exist.",
  limits: "N = 3, W = 2. Real stores retry and have timeouts. The point is only that a strict quorum insists on the usual three nodes.",
  scene: {
    width: 420,
    height: 345,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "needs 2 acks", x: 60, y: 200 },
      { id: "a", label: "Node A", kind: "database", sub: "usual node", x: 360, y: 100 },
      { id: "b", label: "Node B", kind: "database", sub: "usual node", x: 360, y: 200 },
      { id: "c", label: "Node C", kind: "database", sub: "usual node", x: 360, y: 295 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "b", text: "down", tone: "bad" },
      { kind: "say", at: 0.2, actor: "c", text: "down", tone: "bad" },
      { kind: "mark", at: 0.2, actor: "b", tone: "bad" },
      { kind: "mark", at: 0.2, actor: "c", tone: "bad" },
      { kind: "fly", at: 0.6, dur: 1, from: "client", to: "a", label: "write" },
      { kind: "fly", at: 0.6, dur: 1, from: "client", to: "b", label: "write" },
      { kind: "fly", at: 0.6, dur: 1, from: "client", to: "c", label: "write" },
      { kind: "say", at: 1.6, actor: "a", text: "saved", tone: "good" },
      { kind: "fly", at: 1.8, dur: 0.8, from: "a", to: "client", label: "ack", tone: "good" },
      { kind: "say", at: 2.6, actor: "client", text: "1 of 2 acks", tone: "warn" },
      { kind: "say", at: 4, actor: "client", text: "gave up", tone: "bad" },
      { kind: "verdict", at: 4.3, text: "Write refused: only 1 of 2 acks", tone: "bad" },
    ],
    loop: 7.4,
  },
};
