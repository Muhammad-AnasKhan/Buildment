import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.5 beat 5: a sliding window counter, 5 a minute. At 12:01:00 the previous
// minute counts in full (5 x 100%), so the burst is refused; at 12:01:30 it
// counts half (2.5), so 2 more fit.
export const sysdesignM6SlidingCounter: SceneSpec = {
  kind: "scene",
  title: "Sliding counter: weigh the last window",
  purpose: "The counter adds the previous minute's count, weighted by how much of it is still inside the last 60 seconds, to this minute's count.",
  limits: "The strip shows seconds after 12:00:00, so 60 is 12:01:00 and 90 is 12:01:30. The limit of 5 a minute is made up. The estimate assumes last minute's requests were spread evenly.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "script", label: "Script", kind: "worker", sub: "waits for :59", x: 60, y: 110 },
      { id: "limiter", label: "Limiter", kind: "router", sub: "5 a minute", x: 360, y: 110 },
    ],
    strip: { y: 268, from: 50, to: 100, unit: "s", caption: "seconds after 12:00:00", every: 10 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "script", to: "limiter", label: "5 at 0:59" },
      { kind: "say", at: 1.0, actor: "limiter", text: "5 of 5 used" },
      { kind: "tag", at: 1.0, row: 0, value: 59, label: "5 OK at 0:59", tone: "good" },
      { kind: "line", at: 1.5, value: 60, label: "new window" },
      { kind: "fly", at: 1.8, dur: 0.8, from: "script", to: "limiter", label: "5 at 1:00" },
      { kind: "say", at: 2.6, actor: "limiter", text: "5 x 100% = 5", tone: "bad" },
      { kind: "tag", at: 2.6, row: 1, value: 60, label: "5 refused", tone: "bad" },
      { kind: "say", at: 2.8, actor: "script", text: "429 x 5", tone: "bad" },
      { kind: "fly", at: 3.4, dur: 0.8, from: "script", to: "limiter", label: "5 at 1:30" },
      { kind: "say", at: 4.2, actor: "limiter", text: "5 x 50% = 2.5", tone: "good" },
      { kind: "tag", at: 4.2, row: 0, value: 90, label: "2 OK at 1:30", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Edge burst refused; 2 fit at 1:30", tone: "good" },
    ],
    loop: 7.8,
  },
};
