import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.3 beat 6: Decimal arithmetic in floating point is not exact. Whole cents are.
export const sysdesignM25CentsNotFloats: SceneSpec = {
  kind: "scene",
  title: "0.1 + 0.2 is not exactly 0.3",
  purpose: "A program adds the decimals 0.1 and 0.2 and gets 0.30000000000000004. It then adds the whole numbers 10 and 20 (cents) and gets exactly 30. Money is stored as whole cents so every sum is exact.",
  limits: "This is how JavaScript and many other languages add decimal fractions. It says nothing about databases, whose decimal types are exact; the rule here is that a program must never do money arithmetic on binary fractions.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "code", label: "Program", kind: "server", sub: "adds prices", x: 70, y: 100 },
      { id: "calc", label: "Result", kind: "note", sub: "answers", x: 350, y: 100 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "code", to: "calc", label: "0.1 + 0.2" },
      { kind: "fly", at: 1.4, dur: 1.2, from: "calc", to: "code", label: "0.30000000000000004", tone: "bad" },
      { kind: "say", at: 2.7, actor: "code", text: "not exactly 0.3", tone: "bad" },
      { kind: "fly", at: 3.3, dur: 0.9, from: "code", to: "calc", label: "10 + 20 cents" },
      { kind: "fly", at: 4.3, dur: 0.9, from: "calc", to: "code", label: "30 cents", tone: "good" },
      { kind: "say", at: 5.2, actor: "code", text: "exact", tone: "good" },
      { kind: "verdict", at: 5.5, text: "Count whole cents, not decimals", tone: "good" },
    ],
    loop: 9,
  },
};
