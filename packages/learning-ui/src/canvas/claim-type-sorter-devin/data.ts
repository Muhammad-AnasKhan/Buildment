import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 1.2, beat 1: a launch claim meets an outside test.
// The maker's launch number (March 2024, A12) and the outside team's trial of
// 20 tasks (January 2025, A13). Watch-only; the playable canvas of this
// chapter is claim-type-sorter.
export const claimTypeSorterDevin: SceneSpec = {
  kind: "scene",
  title: "A launch claim meets an outside test",
  purpose: "A maker reports a result on its own test. Months later, a team outside the maker tries the tool on 20 real tasks and reports a different kind of result.",
  limits: "Two results from two different tests: one chosen by the maker, one by a small team with 20 tasks. Neither says how the tool does on your work, and the tool has changed since.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "maker", label: "Maker", kind: "user", sub: "sells Devin", x: 70, y: 100 },
      { id: "public", label: "Readers", kind: "note", sub: "hear both", x: 300, y: 100 },
      { id: "outside", label: "Testers", kind: "worker", sub: "20 real tasks", x: 70, y: 222 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.9, from: "maker", to: "public", label: "13.86% solved" },
      { kind: "say", at: 0.9, actor: "public", text: "maker's test", tone: "warn" },
      { kind: "say", at: 0.9, actor: "maker", text: "chose the test" },

      { kind: "fly", at: 2.6, dur: 0.9, from: "outside", to: "public", label: "3 of 20 worked" },
      { kind: "say", at: 3.5, actor: "outside", text: "14 failed", tone: "warn" },
      { kind: "say", at: 3.5, actor: "public", text: "outside, small", tone: "good" },
      { kind: "verdict", at: 4.2, text: "A launch claim is not a test", tone: "accent" },
    ],
    loop: 8,
  },
};
