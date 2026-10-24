import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.5 beat 2: A slow clock makes the later write look older.
export const sysdesignM13LwwSkewStory: SceneSpec = {
  kind: "scene",
  title: "A slow clock makes the later write look older",
  purpose: "Hana saves tea through node A, whose clock is 10 ms fast. She sees OK. Dina then saves rice through node B, whose clock is 10 ms slow. The rice has the smaller stamp, so last write wins drops it.",
  limits: "Two clocks 10 ms off in opposite directions, 20 ms apart, and a gap of 5 ms between the writes. NTP leaves a few milliseconds of error, and drift adds more (chapter 10.2).",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "adds tea", x: 80, y: 100 },
      { id: "a", label: "Node A", kind: "server", sub: "clock +10 ms", x: 340, y: 100 },
      { id: "dina", label: "Dina", kind: "user", sub: "adds rice", x: 80, y: 195 },
      { id: "b", label: "Node B", kind: "server", sub: "clock -10 ms", x: 340, y: 195 },
    ],
    strip: { y: 296, from: 0, to: 40, unit: "ms", caption: "timestamp each node stamps", every: 10 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "hana", to: "a", label: "add tea" },
      { kind: "tag", at: 1.1, row: 0, value: 30, label: "tea, stamp 30", tone: "accent" },
      { kind: "say", at: 1.1, actor: "a", text: "stamps 30", tone: "accent" },
      { kind: "fly", at: 1.3, dur: 0.7, from: "a", to: "hana", label: "OK", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "dina", to: "b", label: "add rice" },
      { kind: "tag", at: 3.2, row: 1, value: 15, label: "rice, stamp 15", tone: "accent" },
      { kind: "say", at: 3.2, actor: "b", text: "stamps 15", tone: "accent" },
      { kind: "fly", at: 3.6, dur: 1, from: "b", to: "a", label: "rice, 15" },
      { kind: "say", at: 4.7, actor: "a", text: "keeps tea", tone: "good" },
      { kind: "say", at: 4.7, actor: "b", text: "drops rice", tone: "bad" },
      { kind: "retone", at: 4.7, label: "rice, stamp 15", tone: "bad" },
      { kind: "mark", at: 4.7, actor: "b", tone: "bad" },
      { kind: "verdict", at: 5, text: "Rice came later but was dropped", tone: "bad" },
    ],
    loop: 8.2,
  },
};
