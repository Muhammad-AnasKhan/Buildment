import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.2 beat 3 (Zones share fate with the code you ship). One bad release goes to all three zones at once.
export const sysdesignM19SharedDeploy: SceneSpec = {
  kind: "scene",
  title: "One bad release reaches all three zones",
  purpose: "The app runs in three zones, but one deploy tool pushes the same release to every zone at once. The release has a bug, so the three zones fail together.",
  limits: "Zones are built so that power and network faults do not hit two zones at once. They cannot protect you from something you send to all of them yourself: code, config, a shared database, a shared DNS record.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "deploy", label: "Deploy tool", kind: "worker", sub: "release 42", x: 210, y: 105 },
      { id: "z1", label: "Zone 1", kind: "server", sub: "running 41", x: 62, y: 215 },
      { id: "z2", label: "Zone 2", kind: "server", sub: "running 41", x: 210, y: 215 },
      { id: "z3", label: "Zone 3", kind: "server", sub: "running 41", x: 358, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "deploy", to: "z1", label: "release 42" },
      { kind: "fly", at: 0.3, dur: 1, from: "deploy", to: "z2", label: "release 42" },
      { kind: "fly", at: 0.3, dur: 1, from: "deploy", to: "z3", label: "release 42" },
      { kind: "say", at: 1.4, actor: "z1", text: "running 42", tone: "warn" },
      { kind: "say", at: 1.4, actor: "z2", text: "running 42", tone: "warn" },
      { kind: "say", at: 1.4, actor: "z3", text: "running 42", tone: "warn" },
      { kind: "say", at: 2.8, actor: "z1", text: "errors", tone: "bad" },
      { kind: "say", at: 2.8, actor: "z2", text: "errors", tone: "bad" },
      { kind: "say", at: 2.8, actor: "z3", text: "errors", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "z1", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "z2", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "z3", tone: "bad" },
      { kind: "verdict", at: 3.2, text: "Same bug everywhere: all zones down", tone: "bad" },
    ],
    loop: 6.4,
  },
};
