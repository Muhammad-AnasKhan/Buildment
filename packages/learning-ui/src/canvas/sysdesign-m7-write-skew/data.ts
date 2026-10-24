import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.4 beat 4. Write skew happens when two transactions read the same facts, then write to different rows, and together they break a rule that each one checked.
export const sysdesignM7WriteSkew: SceneSpec = {
  kind: "scene",
  title: "Write skew: two safe checks, one broken rule",
  purpose: "The rule is: at least one gate stays open. Two staff each check that another gate is open, then each closes a different gate.",
  limits: "Names and gates are made up. The two writes touch different rows, so a row check or a version check on one row does not catch it. At Repeatable Read both commit in PostgreSQL; at Serializable one fails with error 40001.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "a", label: "Staff A", kind: "phone", sub: "closes north", x: 60, y: 100 },
      { id: "b", label: "Staff B", kind: "phone", sub: "closes south", x: 360, y: 100 },
      { id: "db", label: "Gates table", kind: "database", sub: "2 gates open", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "a", to: "db", label: "how many open?" },
      { kind: "fly", at: 0.5, dur: 0.6, from: "b", to: "db", label: "how many open?" },
      { kind: "fly", at: 1.2, dur: 0.6, from: "db", to: "a", label: "2 open", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.6, from: "db", to: "b", label: "2 open", tone: "good" },
      { kind: "say", at: 1.9, actor: "a", text: "ok to close", tone: "good" },
      { kind: "say", at: 2, actor: "b", text: "ok to close", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.7, from: "a", to: "db", label: "close north" },
      { kind: "fly", at: 2.6, dur: 0.7, from: "b", to: "db", label: "close south" },
      { kind: "say", at: 3.5, actor: "db", text: "0 gates open", tone: "bad" },
      { kind: "mark", at: 3.5, actor: "db", tone: "bad" },
      { kind: "verdict", at: 3.9, text: "No gate open. Both checks passed.", tone: "bad" },
    ],
    loop: 6.7,
  },
};
