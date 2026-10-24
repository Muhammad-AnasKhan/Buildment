import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.2 beat 1: two clocks that start together drift apart. 50 ppm is 50
// microseconds per second, so one hour is 180 ms for each clock.
export const sysdesignM10DriftApart: SceneSpec = {
  kind: "scene",
  title: "Two clocks start together and drift apart",
  purpose: "Server A runs 50 ppm fast and server B 50 ppm slow; after one hour A is 180 ms ahead of real time and B is 180 ms behind, so they are 360 ms apart.",
  limits: "50 ppm is the upper end of what most computer clocks do (S52). The two errors point in opposite directions, which is the worst case for the gap between them. Real drift changes with temperature, and a sync would pull the clocks back.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "a", label: "Server A", kind: "clock", sub: "50 ppm fast", x: 70, y: 100 },
      { id: "real", label: "Real time", kind: "clock", sub: "12:00:00", x: 210, y: 100 },
      { id: "b", label: "Server B", kind: "clock", sub: "50 ppm slow", x: 350, y: 100 },
    ],
    strip: { y: 300, from: -200, to: 200, unit: "ms", caption: "clock error", every: 100 },
    events: [
      { kind: "say", at: 0.2, actor: "a", text: "12:00:00" },
      { kind: "say", at: 0.2, actor: "b", text: "12:00:00" },
      { kind: "line", at: 1, value: 0, label: "real time" },
      { kind: "say", at: 1.4, actor: "real", text: "1 hour later", tone: "accent" },
      { kind: "say", at: 2, actor: "a", text: "+180 ms", tone: "warn" },
      { kind: "tag", at: 2, row: 0, value: 180, label: "A +180 ms", tone: "warn" },
      { kind: "say", at: 2.6, actor: "b", text: "-180 ms", tone: "warn" },
      { kind: "tag", at: 2.6, row: 0, value: -180, label: "B -180 ms", tone: "warn" },
      { kind: "verdict", at: 3.6, text: "360 ms apart after one hour", tone: "bad" },
    ],
    loop: 7,
  },
};
