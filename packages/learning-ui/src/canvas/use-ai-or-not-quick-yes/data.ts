import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.4 beat 5: a task where the four questions say yes,
// so the right call is to use AI and check a few rows.
export const useAiOrNotQuickYes: SceneSpec = {
  kind: "scene",
  title: "A task where the answer is yes",
  purpose: "Sami asks an AI assistant to turn 12 made-up sales rows into a table, checks 3 rows by hand, finds 3 of 3 match, and uses the table.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits: "A fictional office worker and made-up rows. Three rows checked by hand catch many mistakes but not all, so the check grows with the stakes. The picture shows a low-risk task, not a rule that three rows is always enough.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "sami", label: "Sami", kind: "user", sub: "office worker", x: 60, y: 110 },
      { id: "ai", label: "AI assistant", kind: "server", sub: "makes a table", x: 360, y: 110 },
      { id: "table", label: "Sales table", kind: "note", sub: "12 made-up rows", x: 360, y: 228 },
      { id: "check", label: "His check", kind: "note", sub: "3 rows by hand", x: 60, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 1, from: "sami", to: "ai", label: "ask table" },
      { kind: "fly", at: 1.2, dur: 1, from: "ai", to: "table", label: "the table" },
      { kind: "fly", at: 2.6, dur: 1.4, from: "table", to: "check", label: "3 rows" },
      { kind: "say", at: 4, actor: "check", text: "3 of 3 match", tone: "good" },
      { kind: "say", at: 4.6, actor: "sami", text: "uses it", tone: "good" },
      { kind: "verdict", at: 5.2, text: "Low risk, checked: use AI", tone: "good" },
    ],
    loop: 8,
  },
};
