import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.2 beat 3 (A paused node does not know).
export const sysdesignM12PausedWakes: SceneSpec = {
  kind: "scene",
  title: "A paused node wakes up and cannot tell it was away",
  purpose: "Node A freezes for 12 seconds. B decides A is dead and starts an election. When A wakes it only sees its own clock jump, and still believes it is the main.",
  limits: "A two-node story. In a real freeze every thread stops, so A runs no code at all while it is paused. A real cluster has more nodes, and the others vote before A is replaced.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "running t=2 s", x: 60, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "watching A", x: 360, y: 100 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "a", text: "main, t=2 s", tone: "good" },
      { kind: "say", at: 1, actor: "a", text: "frozen", tone: "warn" },
      { kind: "mark", at: 1, actor: "a", tone: "warn" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "b", to: "a", label: "ping", tone: "warn" },
      { kind: "say", at: 3, actor: "b", text: "A is dead", tone: "bad" },
      { kind: "say", at: 3.6, actor: "b", text: "elect new main", tone: "accent" },
      { kind: "say", at: 5, actor: "a", text: "awake, t=14 s", tone: "accent" },
      { kind: "say", at: 5.5, actor: "a", text: "still the main", tone: "warn" },
      { kind: "verdict", at: 6, text: "A cannot tell it was paused", tone: "warn" },
    ],
    loop: 9,
  },
};
