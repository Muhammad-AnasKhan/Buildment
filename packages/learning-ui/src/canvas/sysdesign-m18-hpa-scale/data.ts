import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.4 beat 7 (Autoscaling by CPU).
export const sysdesignM18HpaScale: SceneSpec = {
  kind: "scene",
  title: "The autoscaler turns 90% CPU into more pods",
  purpose: "Three pods use 90% of the CPU they asked for. The target is 60%. The rule gives 3 x 90 / 60 = 4.5, rounded up to 5 pods, each at 54%.",
  limits: "CPU is measured against each pod's request, not the machine's size. The autoscaler checks about every 15 seconds, ignores changes inside a 10% tolerance, and waits up to 5 minutes before scaling down. New pods still need time to start.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "hpa", label: "Autoscaler", kind: "worker", sub: "target 60%", x: 60, y: 100 },
      { id: "metrics", label: "Metrics", kind: "database", sub: "CPU 90%", x: 360, y: 100 },
      { id: "dep", label: "Deployment", kind: "server", sub: "3 pods", x: 210, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.9, from: "metrics", to: "hpa", label: "CPU 90%" },
      { kind: "say", at: 1.4, actor: "hpa", text: "3x90/60=4.5", tone: "accent" },
      { kind: "say", at: 2.4, actor: "hpa", text: "round up: 5", tone: "accent" },
      { kind: "fly", at: 2.8, dur: 0.9, from: "hpa", to: "dep", label: "set 5 pods" },
      { kind: "say", at: 3.8, actor: "dep", text: "5 pods", tone: "good" },
      { kind: "say", at: 4.6, actor: "metrics", text: "CPU 54%", tone: "good" },
      { kind: "verdict", at: 5, text: "3 pods at 90% became 5 at 54%", tone: "good" },
    ],
    loop: 8,
  },
};
