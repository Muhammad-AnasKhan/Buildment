import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.3 beat 3 ("A unique name needs one order"). Two copies that each check only themselves hand out the same username twice.
export const sysdesignM11UsernameTwice: SceneSpec = {
  kind: "scene",
  title: "Two people get the same username",
  purpose: "Two sign-ups ask for the name noor at the same moment. Each lands on a different copy, each copy checks only itself, and both say yes.",
  limits: "Two copies and two users. The picture slows the copying down. The fix, one order for every claim, is the next picture.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "u1", label: "User 1", kind: "phone", sub: "wants noor", x: 70, y: 105 },
      { id: "u2", label: "User 2", kind: "phone", sub: "wants noor", x: 350, y: 105 },
      { id: "c1", label: "Copy 1", kind: "database", sub: "noor is free", x: 70, y: 245 },
      { id: "c2", label: "Copy 2", kind: "database", sub: "noor is free", x: 350, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "u1", to: "c1", label: "noor?" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "u2", to: "c2", label: "noor?" },
      { kind: "say", at: 1.2, actor: "c1", text: "free: yes", tone: "good" },
      { kind: "say", at: 1.2, actor: "c2", text: "free: yes", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "c1", to: "u1", label: "yes", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "c2", to: "u2", label: "yes", tone: "good" },
      { kind: "say", at: 2.1, actor: "u1", text: "has noor", tone: "good" },
      { kind: "say", at: 2.1, actor: "u2", text: "has noor", tone: "good" },
      { kind: "fly", at: 2.6, dur: 1.6, from: "c1", to: "c2", label: "noor = 1" },
      { kind: "fly", at: 2.6, dur: 1.6, from: "c2", to: "c1", label: "noor = 2" },
      { kind: "mark", at: 4.2, actor: "c1", tone: "bad" },
      { kind: "mark", at: 4.2, actor: "c2", tone: "bad" },
      { kind: "say", at: 4.2, actor: "c1", text: "two owners", tone: "bad" },
      { kind: "say", at: 4.2, actor: "c2", text: "two owners", tone: "bad" },
      { kind: "verdict", at: 4.3, text: "Two people own the same name", tone: "bad" },
    ],
    loop: 7.6,
  },
};
