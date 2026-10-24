import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.6 beat 1 ("Each region writes at home"). Multi-leader gives fast local writes in every region, at the price of copying to each other afterwards.
export const sysdesignM8TwoLeaders: SceneSpec = {
  kind: "scene",
  title: "Two leaders: each region writes locally",
  purpose: "In multi-leader replication each region has its own leader. A user writes to the nearest one, and the leaders copy to each other later.",
  limits: "The 160 ms is the napkin-math round trip between EU West and Singapore, so one copy takes about 80 ms one way; the picture slows it down. Only two regions and one write each are drawn.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "eu-user", label: "EU user", kind: "phone", sub: "writes A", x: 60, y: 100 },
      { id: "sg-user", label: "SG user", kind: "phone", sub: "writes B", x: 360, y: 100 },
      { id: "eu", label: "EU leader", kind: "database", sub: "empty", x: 60, y: 245 },
      { id: "sg", label: "SG leader", kind: "database", sub: "empty", x: 360, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "eu-user", to: "eu", label: "A" },
      { kind: "fly", at: 0.3, dur: 0.6, from: "sg-user", to: "sg", label: "B" },
      { kind: "say", at: 0.9, actor: "eu", text: "has A", tone: "good" },
      { kind: "say", at: 0.9, actor: "sg", text: "has B", tone: "good" },
      { kind: "say", at: 1, actor: "eu-user", text: "done, fast", tone: "good" },
      { kind: "say", at: 1, actor: "sg-user", text: "done, fast", tone: "good" },
      { kind: "fly", at: 1.4, dur: 1.6, from: "eu", to: "sg", label: "copy A" },
      { kind: "say", at: 3, actor: "sg", text: "A and B", tone: "good" },
      { kind: "fly", at: 3.1, dur: 1.6, from: "sg", to: "eu", label: "copy B" },
      { kind: "say", at: 4.7, actor: "eu", text: "A and B", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Each region writes at home, fast", tone: "good" },
    ],
    loop: 7.8,
  },
};
