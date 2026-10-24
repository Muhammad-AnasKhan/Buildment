import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.5 beat 4: a fixed window of 5 a minute. 5 requests at 12:00:59 fill the
// old window; the count resets at 12:01:00 and 5 more pass: 10 in 2 seconds.
export const sysdesignM6FixedWindowEdge: SceneSpec = {
  kind: "scene",
  title: "Fixed windows let a double burst through",
  purpose: "Five requests just before the minute changes and five just after are counted in two different windows, so all ten pass.",
  limits: "The strip shows seconds after 12:00:00, so 60 is 12:01:00. The limit of 5 a minute is made up. Each window's count is right; the problem is only at the edge between two windows.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "script", label: "Script", kind: "worker", sub: "waits for :59", x: 60, y: 110 },
      { id: "limiter", label: "Limiter", kind: "router", sub: "5 a minute", x: 360, y: 110 },
    ],
    strip: { y: 268, from: 50, to: 70, unit: "s", caption: "seconds after 12:00:00", every: 5 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "script", to: "limiter", label: "5 at 0:59" },
      { kind: "say", at: 1.0, actor: "limiter", text: "5 of 5 used" },
      { kind: "tag", at: 1.0, row: 0, value: 59, label: "5 OK at 0:59", tone: "good" },
      { kind: "line", at: 1.6, value: 60, label: "new window" },
      { kind: "say", at: 1.8, actor: "limiter", text: "reset: 0 of 5", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 0.8, from: "script", to: "limiter", label: "5 at 1:00" },
      { kind: "say", at: 3.0, actor: "limiter", text: "5 of 5 used" },
      { kind: "tag", at: 3.0, row: 1, value: 60, label: "5 more OK at 1:00", tone: "bad" },
      { kind: "say", at: 3.2, actor: "script", text: "10 got in", tone: "bad" },
      { kind: "mark", at: 3.2, actor: "limiter", tone: "bad" },
      { kind: "verdict", at: 3.4, text: "10 in 2 seconds; limit is 5 a minute", tone: "bad" },
    ],
    loop: 6.6,
  },
};
