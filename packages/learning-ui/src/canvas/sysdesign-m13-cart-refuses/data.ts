import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.1 beat 1: A cart that waits for its leader refuses the add.
export const sysdesignM13CartRefuses: SceneSpec = {
  kind: "scene",
  title: "A cart that waits for its leader refuses the add",
  purpose: "Hana taps Add milk. The cart's one leader is down, so nobody may take the write, and the app can only say try again later.",
  limits: "A made-up shop (Souq) with one leader database and one copy that can only be read. Real systems promote the copy after a delay (chapter 8.5); this picture shows the seconds before that happens.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "Add milk", x: 60, y: 110 },
      { id: "leader", label: "Cart leader", kind: "database", sub: "takes writes", x: 360, y: 110 },
      { id: "copy", label: "Copy", kind: "database", sub: "read only", x: 210, y: 205 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "hana", text: "taps Add milk", tone: "accent" },
      { kind: "say", at: 0.3, actor: "leader", text: "down", tone: "bad" },
      { kind: "mark", at: 0.3, actor: "leader", tone: "bad" },
      { kind: "fly", at: 0.9, dur: 1.4, from: "hana", to: "leader", label: "add milk" },
      { kind: "say", at: 2.3, actor: "hana", text: "waiting...", tone: "warn" },
      { kind: "say", at: 3, actor: "copy", text: "cannot write", tone: "warn" },
      { kind: "say", at: 4.2, actor: "hana", text: "try again later", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "Add refused: a sale may be lost", tone: "bad" },
    ],
    loop: 7.5,
  },
};
