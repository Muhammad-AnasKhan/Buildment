import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.2 beat 5: One conditional statement. One winner, and the loser moves on at once.
export const sysdesignM25HoldAtomic: SceneSpec = {
  kind: "scene",
  title: "One statement: one winner, no line",
  purpose: "Dina and Omar both ask to hold seat 7 only if it is free. The store applies the two requests one after the other. Dina gets the hold, Omar is told at once that it is taken, and he tries seat 8.",
  limits: "This is one seat store on one database. The statement is a conditional update that changes a row only if the seat is free or its hold has expired. It says nothing yet about payment, which comes in chapter 25.4.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "dina", label: "Dina", kind: "user", sub: "wants seat 7", x: 70, y: 100 },
      { id: "omar", label: "Omar", kind: "user", sub: "wants seat 7", x: 70, y: 235 },
      { id: "seats", label: "Seats", kind: "database", sub: "7 and 8 free", x: 350, y: 165 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "dina", to: "seats", label: "hold if free" },
      { kind: "fly", at: 1.0, dur: 0.9, from: "omar", to: "seats", label: "hold if free" },
      { kind: "say", at: 2.0, actor: "seats", text: "1 row changed", tone: "accent" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "seats", to: "dina", label: "held 10 min", tone: "good" },
      { kind: "say", at: 3.2, actor: "dina", text: "has the seat", tone: "good" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "seats", to: "omar", label: "taken (409)", tone: "bad" },
      { kind: "say", at: 4.1, actor: "omar", text: "tries seat 8", tone: "warn" },
      { kind: "fly", at: 4.4, dur: 0.8, from: "omar", to: "seats", label: "hold seat 8" },
      { kind: "say", at: 5.2, actor: "seats", text: "7 held, 8 held", tone: "good" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "seats", to: "omar", label: "held 10 min", tone: "good" },
      { kind: "verdict", at: 6.3, text: "The loser moves on at once", tone: "good" },
    ],
    loop: 9.5,
  },
};
