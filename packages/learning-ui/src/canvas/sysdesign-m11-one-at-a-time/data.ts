import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.2 beat 4 ("Pretend it ran one at a time"). In a one-at-a-time order, every read returns the last write before it.
export const sysdesignM11OneAtATime: SceneSpec = {
  kind: "scene",
  title: "One at a time, a read sees the last write",
  purpose: "Ada writes 5, then Ben reads 5. Ada writes 7, then Ben reads 7. This is the rule a legal order must follow.",
  limits: "This is a model of one register in one machine. It says what a correct answer looks like. It does not say how a real system with copies produces it.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "ada", label: "Ada", kind: "user", sub: "writes", x: 80, y: 105 },
      { id: "ben", label: "Ben", kind: "user", sub: "reads", x: 80, y: 235 },
      { id: "store", label: "Store", kind: "database", sub: "x = 0", x: 340, y: 170 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "ada", to: "store", label: "write 5" },
      { kind: "say", at: 1.1, actor: "store", text: "x = 5", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.8, from: "ben", to: "store", label: "read" },
      { kind: "fly", at: 2.3, dur: 0.8, from: "store", to: "ben", label: "5", tone: "good" },
      { kind: "say", at: 3.1, actor: "ben", text: "sees 5", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "ada", to: "store", label: "write 7" },
      { kind: "say", at: 4.4, actor: "store", text: "x = 7", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.8, from: "ben", to: "store", label: "read" },
      { kind: "fly", at: 5.6, dur: 0.8, from: "store", to: "ben", label: "7", tone: "good" },
      { kind: "say", at: 6.4, actor: "ben", text: "sees 7", tone: "good" },
      { kind: "verdict", at: 6.5, text: "A read sees the last write", tone: "good" },
    ],
    loop: 9.5,
  },
};
