import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.3 beat 2: the Lamport rule. A send is an event that adds one; a
// receive jumps past the sender's stamp, or adds one if the node is already ahead.
export const sysdesignM10LamportRule: SceneSpec = {
  kind: "scene",
  title: "A receiver always lands after the sender",
  purpose: "Node A counts two events and sends with stamp 2. Node B, already at 5, takes the larger number and adds 1. Node C, at 0, jumps forward to 8.",
  limits: "Three nodes and two messages. The starting counters (B at 5, C at 0) are chosen to show both cases of the rule. Real systems keep the counter in a variable on each node and attach it to every message.",
  scene: {
    width: 420,
    height: 250,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "clock 0", x: 60, y: 110 },
      { id: "b", label: "Node B", kind: "server", sub: "clock 5", x: 210, y: 110 },
      { id: "c", label: "Node C", kind: "server", sub: "clock 0", x: 360, y: 110 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "a", text: "clock 1" },
      { kind: "say", at: 0.9, actor: "a", text: "clock 2", tone: "accent" },
      { kind: "fly", at: 1.1, dur: 1, from: "a", to: "b", label: "stamp 2" },
      { kind: "say", at: 2.1, actor: "b", text: "max(5,2)+1 = 6", tone: "good" },
      { kind: "say", at: 3, actor: "b", text: "clock 7", tone: "accent" },
      { kind: "fly", at: 3.1, dur: 1, from: "b", to: "c", label: "stamp 7" },
      { kind: "say", at: 4.1, actor: "c", text: "max(0,7)+1 = 8", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Every receive lands after its send", tone: "good" },
    ],
    loop: 8,
  },
};
