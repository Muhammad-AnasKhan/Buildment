import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 2 of 1.2: two versions of Daftar both have search, so both meet the
// functional requirement. Only one answers inside the team's target of
// 1 second. The 4 s and 0.3 s are illustrative.
export const sysdesignM1QualityReqs: SceneSpec = {
  kind: "scene",
  title: "Same feature, very different quality",
  purpose: "Version A and version B both have search; A takes 4 seconds and B takes 0.3 seconds.",
  limits: "Made-up timings for a fictional app. The 1 second target is the team's choice, not a rule. Each version answers one search here; a real target is checked on many requests, using a percentile such as p99.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "student", label: "Student", kind: "user", sub: "needs CS101", x: 70, y: 165 },
      { id: "a", label: "Version A", kind: "server", sub: "has search", x: 240, y: 95 },
      { id: "b", label: "Version B", kind: "server", sub: "has search", x: 240, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.7, from: "student", to: "a", label: "search" },
      { kind: "fly", at: 0, dur: 0.7, from: "student", to: "b", label: "search" },
      { kind: "wait", at: 0.7, dur: 4.0, actor: "a", label: "{n} s", doneLabel: "took 4 s", total: 4 },
      { kind: "wait", at: 0.7, dur: 0.3, actor: "b", label: "{n} s", doneLabel: "took 0.3 s", total: 0.3 },
      { kind: "fly", at: 1.0, dur: 0.7, from: "b", to: "student", label: "3 notes", tone: "good" },
      { kind: "say", at: 1.7, actor: "student", text: "B: got it", tone: "good" },
      { kind: "say", at: 1.7, actor: "b", text: "under 1 s", tone: "good" },
      { kind: "fly", at: 4.7, dur: 0.7, from: "a", to: "student", label: "3 notes", tone: "warn" },
      { kind: "say", at: 5.4, actor: "a", text: "too slow", tone: "bad" },
      { kind: "mark", at: 5.4, actor: "a", tone: "bad" },
      { kind: "say", at: 5.4, actor: "student", text: "A: gave up", tone: "bad" },
      { kind: "verdict", at: 5.6, text: "Same feature, different quality", tone: "warn" },
    ],
    loop: 8.6,
  },
};
