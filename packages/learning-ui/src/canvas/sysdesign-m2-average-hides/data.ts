import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.4 beat 1: ten requests, nine between 8 and 15 ms and one of 1,000 ms.
// Sum 1,101 ms, so the mean is 110 ms; the median (rank 5) is 11 ms.
export const sysdesignM2AverageHides: SceneSpec = {
  kind: "scene",
  title: "The average is a time nobody waited",
  purpose: "Nine requests come back fast and one is very slow; the mean lands between them, where no request was.",
  limits: "Ten made-up requests (8, 9, 10, 10, 11, 12, 12, 14, 15 and 1,000 ms) so the arithmetic is easy to check. Real services have thousands of requests per minute, so the slow ones are a small share but still many people.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "users", kind: "user", label: "Users", sub: "10 requests", x: 60, y: 110 },
      { id: "server", kind: "server", label: "Server", sub: "ready", x: 360, y: 110 },
    ],
    strip: { y: 270, from: 0, to: 1000, unit: "ms", caption: "time to answer", every: 250 },
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "users", to: "server", label: "10 requests" },
      { kind: "say", at: 1.3, actor: "server", text: "9 fast, 1 slow" },
      { kind: "fly", at: 1.5, dur: 0.8, from: "server", to: "users", label: "9 in 8 to 15 ms", tone: "good" },
      { kind: "say", at: 2.3, actor: "users", text: "9 are happy", tone: "good" },
      { kind: "tag", at: 2.3, row: 1, value: 11, label: "p50 11 ms", tone: "good" },
      { kind: "fly", at: 2.5, dur: 1.8, from: "server", to: "users", label: "1 in 1,000 ms", tone: "bad" },
      { kind: "say", at: 4.3, actor: "users", text: "1 waited 1 s", tone: "bad" },
      { kind: "tag", at: 4.3, row: 1, value: 1000, label: "slowest 1,000 ms", tone: "bad" },
      { kind: "tag", at: 4.6, row: 0, value: 110, label: "average 110 ms", tone: "warn" },
      { kind: "verdict", at: 4.9, text: "Average 110 ms: nobody waited that", tone: "warn" },
    ],
    loop: 8,
  },
};
