import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.4 beat 5 (Failing back is a second, planned move). Region A returns holding writes that Region B never saw.
export const sysdesignM19Failback: SceneSpec = {
  kind: "scene",
  title: "Region A returns, but it is no longer the truth",
  purpose: "Region A comes back holding 300 writes that Region B never received. B has been the primary for an hour. A must first become a copy of B, and users move back later, on purpose.",
  limits: "The 300 writes and the order of steps are course examples. In a real failback a person or a tool decides what happens to A's extra writes before A rejoins.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "users", label: "Customers", kind: "phone", sub: "use Region B", x: 210, y: 105 },
      { id: "a", label: "Region A", kind: "database", sub: "was primary", x: 62, y: 215 },
      { id: "b", label: "Region B", kind: "database", sub: "now primary", x: 358, y: 215 },
    ],
    events: [
      { kind: "say", at: 0.4, actor: "a", text: "back, 300 extra", tone: "warn" },
      { kind: "mark", at: 0.4, actor: "a", tone: "warn" },
      { kind: "fly", at: 1.2, dur: 1.4, from: "b", to: "a", label: "resync from B" },
      { kind: "say", at: 2.7, actor: "a", text: "300 set aside", tone: "warn" },
      { kind: "say", at: 3.4, actor: "a", text: "copy of B", tone: "good" },
      { kind: "say", at: 4.2, actor: "users", text: "quiet hour: go", tone: "accent" },
      { kind: "fly", at: 4.6, dur: 1.1, from: "users", to: "a", label: "orders" },
      { kind: "say", at: 5.8, actor: "a", text: "primary again", tone: "good" },
      { kind: "say", at: 5.8, actor: "b", text: "standby", tone: "good" },
      { kind: "say", at: 5.8, actor: "users", text: "use Region A", tone: "good" },
      { kind: "verdict", at: 6, text: "Failback is a second, planned move", tone: "accent" },
    ],
    loop: 9,
  },
};
