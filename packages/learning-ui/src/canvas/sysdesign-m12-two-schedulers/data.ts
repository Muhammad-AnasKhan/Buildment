import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.1 beat 1 (Two schedulers, one bill).
export const sysdesignM12TwoSchedulers: SceneSpec = {
  kind: "scene",
  title: "Two schedulers both think they are in charge",
  purpose: "The main scheduler freezes, the standby takes over, then the main wakes up and carries on: the billing database gets the same charge twice.",
  limits: "A made-up billing app. The 12 second freeze and 5 second wait are course numbers; a real freeze can come from a long garbage collection, a stalled virtual machine or a swapped-out process. Real systems have many customers, not one.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "a", label: "Scheduler A", kind: "server", sub: "the main", x: 60, y: 100 },
      { id: "b", label: "Scheduler B", kind: "server", sub: "the standby", x: 360, y: 100 },
      { id: "db", label: "Billing DB", kind: "database", sub: "no charges", x: 210, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "a", to: "b", label: "beat", tone: "good" },
      { kind: "say", at: 0.4, actor: "a", text: "beat ok", tone: "good" },
      { kind: "say", at: 1.7, actor: "a", text: "frozen 12 s", tone: "warn" },
      { kind: "mark", at: 1.7, actor: "a", tone: "warn" },
      { kind: "say", at: 2.7, actor: "b", text: "no beat 5 s", tone: "warn" },
      { kind: "say", at: 3.3, actor: "b", text: "I am the main", tone: "accent" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "b", to: "db", label: "charge Dana" },
      { kind: "say", at: 4.4, actor: "db", text: "charged once" },
      { kind: "say", at: 4.9, actor: "a", text: "awake, I lead", tone: "warn" },
      { kind: "fly", at: 5.1, dur: 0.9, from: "a", to: "db", label: "charge Dana" },
      { kind: "say", at: 6, actor: "db", text: "charged twice", tone: "bad" },
      { kind: "mark", at: 6, actor: "db", tone: "bad" },
      { kind: "verdict", at: 6.3, text: "Dana was billed twice", tone: "bad" },
    ],
    loop: 9.6,
  },
};
