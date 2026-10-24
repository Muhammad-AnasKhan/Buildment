import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.3 beat 3 (A replica copies the mistake). A DELETE with no WHERE reaches every replica in about a second.
export const sysdesignM19CopyMistake: SceneSpec = {
  kind: "scene",
  title: "The replicas copy the delete too",
  purpose: "A developer deletes every order by mistake on the primary. The primary copies each change to its replicas, so the replicas empty their orders table as well.",
  limits: "One primary and two replicas with a copy time of about a second. The copy is shown slowly so you can watch it.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "dev", label: "Developer", kind: "user", sub: "runs DELETE", x: 62, y: 150 },
      { id: "primary", label: "Primary", kind: "database", sub: "orders: 5,000", x: 210, y: 150 },
      { id: "r1", label: "Replica 1", kind: "database", sub: "orders: 5,000", x: 358, y: 95 },
      { id: "r2", label: "Replica 2", kind: "database", sub: "orders: 5,000", x: 358, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "dev", to: "primary", label: "delete all", tone: "warn" },
      { kind: "say", at: 1.3, actor: "primary", text: "orders: 0", tone: "bad" },
      { kind: "fly", at: 1.6, dur: 1.1, from: "primary", to: "r1", label: "copy", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 1.1, from: "primary", to: "r2", label: "copy", tone: "warn" },
      { kind: "say", at: 2.8, actor: "r1", text: "orders: 0", tone: "bad" },
      { kind: "say", at: 2.8, actor: "r2", text: "orders: 0", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "r1", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "r2", tone: "bad" },
      { kind: "verdict", at: 3.2, text: "Replicas copied the mistake too", tone: "bad" },
    ],
    loop: 6.2,
  },
};
