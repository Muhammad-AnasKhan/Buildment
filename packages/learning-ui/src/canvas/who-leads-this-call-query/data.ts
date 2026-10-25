import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.2 beat 2: a call where the AI drafts and Manar
// (fictional) decides, because she can check the result and undo a mistake.
export const whoLeadsThisCallQuery: SceneSpec = {
  kind: "scene",
  title: "A 40-line query she can test",
  purpose: "Manar asks an AI assistant for a 40-line report query, runs it on a copy of the data, sees the totals match a hand count, and decides to use it.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits: "A fictional freelancer and café. Checking totals on a copy catches wrong sums, not every flaw: a query can match three shops and still fail on the fourth, so she keeps the hand count in her notes.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "manar", label: "Manar", kind: "user", sub: "freelancer", x: 60, y: 110 },
      { id: "ai", label: "AI assistant", kind: "server", sub: "drafts", x: 360, y: 110 },
      { id: "copy", label: "Copy of data", kind: "database", sub: "3 shops", x: 60, y: 228 },
      { id: "report", label: "Report", kind: "note", sub: "monthly sales", x: 360, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 1, from: "manar", to: "ai", label: "ask query" },
      { kind: "fly", at: 1.2, dur: 1, from: "ai", to: "manar", label: "40 lines" },
      { kind: "fly", at: 2.4, dur: 1, from: "manar", to: "copy", label: "run on copy" },
      { kind: "say", at: 3.6, actor: "copy", text: "totals match", tone: "good" },
      { kind: "say", at: 4.2, actor: "manar", text: "she decides", tone: "good" },
      { kind: "fly", at: 4.8, dur: 1.2, from: "copy", to: "report", label: "monthly totals" },
      { kind: "say", at: 6, actor: "report", text: "ready to use", tone: "good" },
      { kind: "verdict", at: 6.4, text: "Checked and undoable: AI drafts", tone: "good" },
    ],
    loop: 9.5,
  },
};
