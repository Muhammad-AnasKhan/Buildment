import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.1 beat 1: two servers' logs merged by timestamp put the effect before
// its cause, because the payments clock runs 60 ms fast.
export const sysdesignM10LogMerge: SceneSpec = {
  kind: "scene",
  title: "A merged log says confirmed before paid",
  purpose: "The payments server stamps 'paid' with a clock that is 60 ms fast; the orders server stamps 'confirmed' 12 ms later with a correct clock; sorting by timestamp reverses cause and effect.",
  limits: "A made-up shop called Souq. The 60 ms error is what a clock with a 50 ppm drift gains in 20 minutes without a sync, and the 12 ms travel time is invented. Real logs have more servers and more error, but the reversal works the same way.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "pay", label: "Payments", kind: "server", sub: "clock +60 ms", x: 60, y: 100 },
      { id: "ord", label: "Orders", kind: "server", sub: "clock on time", x: 360, y: 100 },
      { id: "log", label: "Merged log", kind: "note", sub: "sorted by time", x: 210, y: 175 },
    ],
    strip: { y: 300, from: 0, to: 80, unit: "ms", caption: "timestamp after 10:15:00", every: 20 },
    events: [
      { kind: "say", at: 0.3, actor: "pay", text: "took payment", tone: "warn" },
      { kind: "tag", at: 0.4, row: 0, value: 60, label: "paid .060", tone: "warn" },
      { kind: "fly", at: 0.9, dur: 1.2, from: "pay", to: "ord", label: "paid!" },
      { kind: "say", at: 2.1, actor: "ord", text: "confirmed", tone: "good" },
      { kind: "tag", at: 2.2, row: 1, value: 12, label: "confirmed .012", tone: "good" },
      { kind: "fly", at: 3, dur: 1, from: "pay", to: "log", label: "log line" },
      { kind: "fly", at: 3, dur: 1, from: "ord", to: "log", label: "log line" },
      { kind: "say", at: 4, actor: "log", text: "confirmed 1st", tone: "bad" },
      { kind: "mark", at: 4, actor: "log", tone: "bad" },
      { kind: "verdict", at: 4.6, text: "Log says confirmed before paid", tone: "bad" },
    ],
    loop: 8,
  },
};
