import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.2 beat 1 (Silence says nothing).
export const sysdesignM12SlowOrDead: SceneSpec = {
  kind: "scene",
  title: "A monitor cannot tell a slow node from a dead one",
  purpose: "The monitor pings two nodes and hears nothing for 200 ms. One was only slow and answers late; the other crashed. The silence looked identical.",
  limits: "One monitor, two nodes and one ping each. The 200 ms timeout and the late answer are course numbers. Real monitors send many pings and watch the pattern, which the next beats show.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "m", label: "Monitor", kind: "server", sub: "pinging", x: 210, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "?", x: 60, y: 190 },
      { id: "c", label: "Node C", kind: "server", sub: "?", x: 360, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "m", to: "b", label: "ping" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "m", to: "c", label: "ping" },
      { kind: "wait", at: 1.3, dur: 2.2, actor: "m", label: "wait {n} ms", doneLabel: "timed out", total: 200 },
      { kind: "say", at: 3.7, actor: "m", text: "B, C silent", tone: "warn" },
      { kind: "fly", at: 4, dur: 1, from: "b", to: "m", label: "pong (late)", tone: "good" },
      { kind: "say", at: 5, actor: "b", text: "just slow", tone: "good" },
      { kind: "say", at: 5, actor: "c", text: "crashed", tone: "bad" },
      { kind: "mark", at: 5, actor: "c", tone: "bad" },
      { kind: "verdict", at: 5.5, text: "Same silence, two different causes", tone: "warn" },
    ],
    loop: 8.6,
  },
};
