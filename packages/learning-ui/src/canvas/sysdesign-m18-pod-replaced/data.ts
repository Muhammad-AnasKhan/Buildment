import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.4 beat 2 (Kill a pod, a new one starts).
export const sysdesignM18PodReplaced: SceneSpec = {
  kind: "scene",
  title: "A pod crashes and the controller starts another",
  purpose: "The Deployment wants 3 pods. When one crashes, the controller sees 2 of 3 and starts a new pod until 3 are running again.",
  limits: "The new pod needs time to start and pass its readiness check. In the challenge run, a deleted pod was replaced in under a second and all 3 pods were ready again after about 6 seconds, with the 3-second warm-up of the sample service.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "ctrl", label: "Controller", kind: "worker", sub: "wants 3 pods", x: 60, y: 145 },
      { id: "a", label: "Pod A", kind: "server", sub: "running", x: 360, y: 80 },
      { id: "b", label: "Pod B", kind: "server", sub: "running", x: 360, y: 145 },
      { id: "c", label: "Pod C", kind: "server", sub: "running", x: 360, y: 210 },
    ],
    events: [
      { kind: "say", at: 1, actor: "b", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1, actor: "b", tone: "bad" },
      { kind: "say", at: 1.6, actor: "ctrl", text: "sees 2 of 3", tone: "warn" },
      { kind: "fly", at: 2, dur: 0.8, from: "ctrl", to: "b", label: "new pod" },
      { kind: "say", at: 2.9, actor: "b", text: "starting", tone: "accent" },
      { kind: "say", at: 3.9, actor: "b", text: "running", tone: "good" },
      { kind: "say", at: 4.1, actor: "ctrl", text: "3 of 3", tone: "good" },
      { kind: "verdict", at: 4.3, text: "Wanted 3, got 3 again", tone: "good" },
    ],
    loop: 7.3,
  },
};
