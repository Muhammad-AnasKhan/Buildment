import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.5 beat 1: with plain wall-clock stamps, a receive can be stamped
// before its own send when the receiver's clock runs behind.
export const sysdesignM10WallBreaksCause: SceneSpec = {
  kind: "scene",
  title: "Wall time alone stamps the effect first",
  purpose: "Node A sends at its time 100. The message takes 10 ms. Node B's clock is 40 ms behind, so it stamps the receive 70, earlier than the send.",
  limits: "The numbers are made up: 40 ms of skew is an ordinary gap after a long time without a sync, and 10 ms is a normal trip inside a data centre. The same thing happens with any skew larger than the travel time.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "on time", x: 70, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "40 ms slow", x: 350, y: 100 },
    ],
    strip: { y: 300, from: 60, to: 120, unit: "ms", caption: "wall-clock stamp", every: 20 },
    events: [
      { kind: "say", at: 0.3, actor: "a", text: "sends at 100", tone: "accent" },
      { kind: "tag", at: 0.4, row: 0, value: 100, label: "send 100", tone: "accent" },
      { kind: "fly", at: 0.9, dur: 1.2, from: "a", to: "b", label: "update" },
      { kind: "say", at: 2.1, actor: "b", text: "clock reads 70", tone: "warn" },
      { kind: "tag", at: 2.2, row: 1, value: 70, label: "receive 70", tone: "bad" },
      { kind: "mark", at: 2.2, actor: "b", tone: "bad" },
      { kind: "verdict", at: 3, text: "Receive stamped before its send", tone: "bad" },
    ],
    loop: 6.6,
  },
};
