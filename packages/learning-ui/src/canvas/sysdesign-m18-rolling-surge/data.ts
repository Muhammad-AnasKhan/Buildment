import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.4 beat 6 (A rolling update swaps a few at a time).
export const sysdesignM18RollingSurge: SceneSpec = {
  kind: "scene",
  title: "A rolling update adds one new pod, then removes one old pod",
  purpose: "With 3 pods, one extra allowed and none allowed to be missing, each new pod must be ready before an old one stops.",
  limits: "Matches the careful manifest in the challenge: maxSurge 1 and maxUnavailable 0. The Kubernetes defaults are 25% for both, which for 4 pods is 1 and 1. The picture shows one version change; a rollback is another rolling update.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "o1", label: "Old 1", kind: "server", sub: "v1 ready", x: 60, y: 95 },
      { id: "o2", label: "Old 2", kind: "server", sub: "v1 ready", x: 210, y: 95 },
      { id: "o3", label: "Old 3", kind: "server", sub: "v1 ready", x: 360, y: 95 },
      { id: "n1", label: "New 1", kind: "server", sub: "not created", x: 60, y: 190 },
      { id: "n2", label: "New 2", kind: "server", sub: "not created", x: 210, y: 190 },
      { id: "n3", label: "New 3", kind: "server", sub: "not created", x: 360, y: 190 },
    ],
    events: [
      { kind: "say", at: 0.5, actor: "n1", text: "starting", tone: "accent" },
      { kind: "say", at: 1.4, actor: "n1", text: "v2 ready", tone: "good" },
      { kind: "say", at: 1.7, actor: "o1", text: "stopped", tone: "warn" },
      { kind: "say", at: 2.3, actor: "n2", text: "starting", tone: "accent" },
      { kind: "say", at: 3.2, actor: "n2", text: "v2 ready", tone: "good" },
      { kind: "say", at: 3.5, actor: "o2", text: "stopped", tone: "warn" },
      { kind: "say", at: 4.1, actor: "n3", text: "starting", tone: "accent" },
      { kind: "say", at: 5, actor: "n3", text: "v2 ready", tone: "good" },
      { kind: "say", at: 5.3, actor: "o3", text: "stopped", tone: "warn" },
      { kind: "verdict", at: 5.7, text: "Never fewer than 3 ready pods", tone: "good" },
    ],
    loop: 8.3,
  },
};
