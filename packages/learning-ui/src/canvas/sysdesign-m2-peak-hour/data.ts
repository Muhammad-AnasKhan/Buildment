import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.3 beat 2: Sada's average is 20 million requests / 86,400 s = about 231 per
// second. With an assumed peak factor of 3, the evening rush is about 700.
export const sysdesignM2PeakHour: SceneSpec = {
  kind: "scene",
  title: "The evening rush is three times the average",
  purpose: "Requests are spread unevenly over the day, so the busiest hour carries far more than the daily average.",
  limits: "The peak factor of 3 is an assumption for this course example, not a measured value. Measure your own traffic by the minute and use its busiest minute. Only a few requests are drawn.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "phones", kind: "phone", label: "Phones", sub: "1 M users", x: 60, y: 110 },
      { id: "server", kind: "server", label: "Sada API", sub: "quiet morning", x: 360, y: 110 },
    ],
    strip: { y: 280, from: 0, to: 24, unit: "h", caption: "hour of the day", every: 6 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "phones", to: "server", label: "request" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "phones", to: "server", label: "request" },
      { kind: "say", at: 2.2, actor: "server", text: "230 req/s" },
      { kind: "tag", at: 2.2, row: 1, value: 12, label: "average 230/s" },
      { kind: "say", at: 2.8, actor: "phones", text: "evening rush", tone: "warn" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "phones", to: "server", label: "request" },
      { kind: "fly", at: 3.0, dur: 0.7, from: "phones", to: "server", label: "request" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "phones", to: "server", label: "request" },
      { kind: "fly", at: 3.4, dur: 0.7, from: "phones", to: "server", label: "request" },
      { kind: "say", at: 4.1, actor: "server", text: "700 req/s", tone: "warn" },
      { kind: "mark", at: 4.1, actor: "server", tone: "warn" },
      { kind: "tag", at: 4.1, row: 0, value: 21, label: "peak 700/s", tone: "warn" },
      { kind: "verdict", at: 4.4, text: "Size for 700/s, not 230/s", tone: "warn" },
    ],
    loop: 7.4,
  },
};
