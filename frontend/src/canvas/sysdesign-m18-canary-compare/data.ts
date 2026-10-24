import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.6 beat 3 (Canary: a few users first).
export const sysdesignM18CanaryCompare: SceneSpec = {
  kind: "scene",
  title: "A canary shows a bug to 5% of users, not all of them",
  purpose: "The router sends 5% of users to the canary and 95% to the stable version. The canary's error rate is far above the stable one, so the router sends the canary 0%.",
  limits: "Compare the canary with the stable version at the same time, not with last week. A canary with 5% of traffic needs enough requests to show a real difference; very small errors take longer to see.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "users", label: "Users", kind: "user", x: 60, y: 145 },
      { id: "router", label: "Router", kind: "router", sub: "95 / 5 split", x: 210, y: 145 },
      { id: "stable", label: "Stable", kind: "server", sub: "0.2% errors", x: 360, y: 95 },
      { id: "canary", label: "Canary", kind: "server", sub: "5% of users", x: 360, y: 195 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "users", to: "router", label: "95%" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "router", to: "stable", label: "95%" },
      { kind: "fly", at: 1.7, dur: 0.6, from: "users", to: "router", label: "5%" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "router", to: "canary", label: "5%" },
      { kind: "say", at: 3.2, actor: "canary", text: "9% errors", tone: "bad" },
      { kind: "mark", at: 3.2, actor: "canary", tone: "bad" },
      { kind: "say", at: 3.8, actor: "router", text: "canary to 0%", tone: "warn" },
      { kind: "verdict", at: 4.3, text: "5% of users saw the bug, 95% did not", tone: "good" },
    ],
    loop: 7.3,
  },
};
