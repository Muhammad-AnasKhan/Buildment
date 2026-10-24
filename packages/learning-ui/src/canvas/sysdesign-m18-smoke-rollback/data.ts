import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.5 beat 5 (A smoke test can undo a release).
export const sysdesignM18SmokeRollback: SceneSpec = {
  kind: "scene",
  title: "A failed smoke test rolls the release back by itself",
  purpose: "The pipeline starts one pod of v2 next to the running v1, runs a smoke test, sees an error and removes v2. Users stay on v1 the whole time.",
  limits: "A smoke test only asks whether the new version starts and answers the main requests. It does not prove the release is good. Slower problems show up only under real traffic, which canaries and metrics cover (chapter 18.6).",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "pipe", label: "Pipeline", kind: "worker", x: 60, y: 145 },
      { id: "new", label: "New v2", kind: "server", sub: "1 pod", x: 360, y: 95 },
      { id: "old", label: "Old v1", kind: "server", sub: "serving", x: 360, y: 195 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "pipe", to: "new", label: "deploy v2" },
      { kind: "say", at: 1.3, actor: "new", text: "starting", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 0.7, from: "pipe", to: "new", label: "smoke test" },
      { kind: "fly", at: 2.5, dur: 0.7, from: "new", to: "pipe", label: "500", tone: "bad" },
      { kind: "say", at: 3.2, actor: "pipe", text: "smoke failed", tone: "bad" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "pipe", to: "new", label: "roll back" },
      { kind: "say", at: 4.5, actor: "new", text: "removed", tone: "warn" },
      { kind: "say", at: 4.5, actor: "old", text: "still serving", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Smoke test failed: rolled back", tone: "good" },
    ],
    loop: 7.8,
  },
};
