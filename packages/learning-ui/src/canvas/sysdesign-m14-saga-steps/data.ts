import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.3 beat 1 (Small commits in a row).
export const sysdesignM14SagaSteps: SceneSpec = {
  kind: "scene",
  title: "A saga: three small commits instead of one big one",
  purpose: "Each service commits its own step on its own, one after the other. No lock is held across all three.",
  limits: "Only the happy path. The next beats show what happens when a step fails.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "stock", label: "Stock", kind: "database", sub: "1 step", x: 60, y: 100 },
      { id: "pay", label: "Payments", kind: "server", sub: "2 step", x: 360, y: 100 },
      { id: "courier", label: "Courier", kind: "server", sub: "3 step", x: 210, y: 230 },
    ],
    events: [
      { kind: "say", at: 0.5, actor: "stock", text: "reserved 1", tone: "good" },
      { kind: "fly", at: 1, dur: 0.8, from: "stock", to: "pay", label: "then" },
      { kind: "say", at: 1.9, actor: "pay", text: "charged 18", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "pay", to: "courier", label: "then" },
      { kind: "say", at: 3.3, actor: "courier", text: "van booked", tone: "good" },
      { kind: "verdict", at: 4, text: "Three small commits, no big lock", tone: "good" },
    ],
    loop: 6.5,
  },
};
