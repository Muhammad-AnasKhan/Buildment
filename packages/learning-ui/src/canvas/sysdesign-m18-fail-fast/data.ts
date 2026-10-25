import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.5 beat 3 (Cheap checks first).
export const sysdesignM18FailFast: SceneSpec = {
  kind: "scene",
  title: "The same bug is found in 0.2 seconds or in 25 seconds",
  purpose: "One pipeline runs the cheap lint check first. The other builds the image first. Both find the same Dockerfile mistake, but the second is much later.",
  limits: "Measured in the challenge with the naive Dockerfile: lint 0.2 s in the cheap-first order; 24.6 s in the slow-first order, with the cold image build 12.2 s. Real pipelines have more stages and queue time on shared runners.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "you", label: "You", kind: "user", sub: "push a bug", x: 60, y: 145 },
      { id: "fast", label: "Fast first", kind: "worker", sub: "lint first", x: 360, y: 100 },
      { id: "slow", label: "Slow first", kind: "worker", sub: "build first", x: 360, y: 190 },
    ],
    strip: { y: 296, from: 0, to: 25, unit: " s", caption: "seconds until the pipeline is red", every: 5 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "you", to: "fast", label: "push" },
      { kind: "fly", at: 0.3, dur: 0.7, from: "you", to: "slow", label: "push" },
      { kind: "say", at: 1.2, actor: "fast", text: "red!", tone: "bad" },
      { kind: "tag", at: 1.3, row: 0, value: 0.2, label: "fast: 0.2 s", tone: "good" },
      { kind: "say", at: 1.2, actor: "slow", text: "building...", tone: "warn" },
      { kind: "say", at: 3.2, actor: "slow", text: "red!", tone: "bad" },
      { kind: "tag", at: 3.3, row: 1, value: 25, label: "slow: 25 s", tone: "bad" },
      { kind: "verdict", at: 3.6, text: "Same failure: 0.2 s or 25 s", tone: "warn" },
    ],
    loop: 6.8,
  },
};
