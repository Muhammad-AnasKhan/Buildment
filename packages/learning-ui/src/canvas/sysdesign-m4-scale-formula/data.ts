import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.6: the Kubernetes Horizontal Pod Autoscaler rule. 4 servers at 90% CPU
// with a 60% target: ceil(4 x 90 / 60) = 6.
export const sysdesignM4ScaleFormula: SceneSpec = {
  kind: "scene",
  title: "The autoscaler turns a signal into a count",
  purpose: "The autoscaler reads the servers' average CPU, compares it with the target and computes how many servers would bring it back: 4 x 90 / 60 = 6.",
  limits: "The rule assumes load spreads evenly and CPU falls in step with the number of servers. The two new servers are drawn ready after a short boot; the next chapter beat shows how long that takes.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "auto", label: "Autoscaler", kind: "worker", sub: "target 60%", x: 62, y: 110 },
      { id: "fleet", label: "Servers", kind: "server", sub: "4 at 90% CPU", x: 358, y: 110 },
      { id: "rule", label: "Rule", kind: "note", sub: "n x use / goal", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "fleet", to: "auto", label: "CPU 90%" },
      { kind: "fly", at: 1, dur: 0.7, from: "auto", to: "rule", label: "4 x 90 / 60" },
      { kind: "say", at: 1.7, actor: "rule", text: "= 6 servers", tone: "good" },
      { kind: "fly", at: 2.1, dur: 0.6, from: "rule", to: "auto", label: "want 6" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "auto", to: "fleet", label: "add 2" },
      { kind: "say", at: 3.6, actor: "fleet", text: "2 booting", tone: "warn" },
      { kind: "say", at: 4.6, actor: "fleet", text: "6 at 60% CPU", tone: "good" },
      { kind: "verdict", at: 4.8, text: "ceil(4 x 90 / 60) = 6 servers", tone: "good" },
    ],
    loop: 7.8,
  },
};
