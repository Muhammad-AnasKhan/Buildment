import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.7 beat 5 (Managed means the provider repairs it).
export const sysdesignM18ManagedFailover: SceneSpec = {
  kind: "scene",
  title: "A managed database fails over to its standby for you",
  purpose: "The primary database in zone a fails. The provider promotes the standby in zone b, and the app reconnects to the same name.",
  limits: "Failover is not instant and in-flight writes can fail. Managed also means less control: you cannot log in to the machine or tune everything. The picture shows the idea, not a failover time.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "app", label: "App", kind: "server", x: 60, y: 145 },
      { id: "primary", label: "Primary", kind: "database", sub: "zone a", x: 360, y: 95 },
      { id: "standby", label: "Standby", kind: "database", sub: "zone b", x: 360, y: 195 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "primary", label: "query" },
      { kind: "say", at: 1.3, actor: "primary", text: "zone a down", tone: "bad" },
      { kind: "mark", at: 1.3, actor: "primary", tone: "bad" },
      { kind: "say", at: 1.7, actor: "app", text: "errors", tone: "bad" },
      { kind: "say", at: 2.4, actor: "standby", text: "promoted", tone: "accent" },
      { kind: "say", at: 3.1, actor: "app", text: "reconnects", tone: "accent" },
      { kind: "fly", at: 3.5, dur: 0.8, from: "app", to: "standby", label: "query" },
      { kind: "say", at: 4.4, actor: "app", text: "works", tone: "good" },
      { kind: "verdict", at: 4.7, text: "The provider promoted the standby", tone: "good" },
    ],
    loop: 7.7,
  },
};
