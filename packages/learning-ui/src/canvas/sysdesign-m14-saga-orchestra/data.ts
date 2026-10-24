import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.3 beat 3 (One conductor).
export const sysdesignM14SagaOrchestra: SceneSpec = {
  kind: "scene",
  title: "Orchestration: one orchestrator tells each service what to do",
  purpose: "The orchestrator sends a command to each service in turn and waits for its reply. The whole plan lives in one place.",
  limits: "The orchestrator is drawn as always alive. In a real system its progress is saved in a table so a new copy can carry on after a crash (challenge 13).",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "orch", label: "Orchestrator", kind: "server", sub: "knows the plan", x: 210, y: 100 },
      { id: "stock", label: "Stock", kind: "database", sub: "waiting", x: 60, y: 230 },
      { id: "pay", label: "Payments", kind: "server", sub: "waiting", x: 210, y: 230 },
      { id: "courier", label: "Courier", kind: "server", sub: "waiting", x: 360, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "orch", to: "stock", label: "reserve" },
      { kind: "say", at: 1, actor: "stock", text: "reserved", tone: "good" },
      { kind: "fly", at: 1.1, dur: 0.7, from: "stock", to: "orch", label: "done" },
      { kind: "fly", at: 2, dur: 0.7, from: "orch", to: "pay", label: "charge" },
      { kind: "say", at: 2.7, actor: "pay", text: "charged", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "pay", to: "orch", label: "done" },
      { kind: "fly", at: 3.7, dur: 0.7, from: "orch", to: "courier", label: "book" },
      { kind: "say", at: 4.4, actor: "courier", text: "booked", tone: "good" },
      { kind: "fly", at: 4.5, dur: 0.7, from: "courier", to: "orch", label: "done" },
      { kind: "verdict", at: 5.4, text: "One place knows the whole plan", tone: "good" },
    ],
    loop: 8,
  },
};
