import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.8 beat 3 (Ask a friend to check).
export const sysdesignM12SwimIndirect: SceneSpec = {
  kind: "scene",
  title: "A failed ping triggers a check through helpers before any blame",
  purpose: "A pings B and gets no ack. A asks helpers C and D to ping B for it. B answers C, C tells A, and A learns that B is alive. The direct link was the problem, not B.",
  limits: "One probe round with two helpers. SWIM picks k helpers at random for each probe. If none of them hear from B either, A marks B as suspected, which the next beat shows.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "probing B", x: 60, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "alive", x: 360, y: 100 },
      { id: "c", label: "Helper C", kind: "server", sub: "idle", x: 135, y: 190 },
      { id: "d", label: "Helper D", kind: "server", sub: "idle", x: 285, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "a", to: "b", label: "ping" },
      { kind: "say", at: 1.5, actor: "a", text: "no ack in time", tone: "warn" },
      { kind: "fly", at: 1.9, dur: 0.9, from: "a", to: "c", label: "ping-req B" },
      { kind: "fly", at: 1.9, dur: 0.9, from: "a", to: "d", label: "ping-req B" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "c", to: "b", label: "ping" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "d", to: "b", label: "ping" },
      { kind: "fly", at: 3.9, dur: 0.9, from: "b", to: "c", label: "ack", tone: "good" },
      { kind: "fly", at: 4.9, dur: 0.9, from: "c", to: "a", label: "B is alive", tone: "good" },
      { kind: "say", at: 5.9, actor: "a", text: "B: alive", tone: "good" },
      { kind: "verdict", at: 6.2, text: "B was slow, not dead", tone: "good" },
    ],
    loop: 9.2,
  },
};
