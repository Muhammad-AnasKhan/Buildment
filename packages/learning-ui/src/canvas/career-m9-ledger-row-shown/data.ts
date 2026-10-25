import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 9, chapter 9.1 beat 2: Ismail opens his ledger row.
// Escaped bugs per release from the bug tracker: 10 over five releases before, 6 over five after.
// 10 to 6 is 40 percent. His regression checklist is his change; the team also began code review.
// Card register. Ismail is a fictional fellow; the picture is a story, not data.
export const careerM9LedgerRowShown: SceneSpec = {
  kind: "scene",
  title: "He opens the ledger",
  purpose: "Ismail opens his ledger row: escaped bugs per release from the bug tracker, 10 over five releases before and 6 over five after. His regression checklist is his change. The team also began code review in the same period, so he says the drop is shared.",
  limits: "Ismail is a fictional fellow and his numbers are illustrative. 10 to 6 is 40 percent. A before and after of this kind is a weak design, which is why he names what else changed.",
  hint: "Source, window, his change, what else changed.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "ismail", label: "Ismail", kind: "user", sub: "opens the row", x: 62, y: 105 },
      { id: "mentor", label: "Mentor", kind: "user", sub: "asked where", x: 358, y: 105 },
      { id: "ledger", label: "Ledger row", kind: "note", sub: "10 to 6", x: 62, y: 250 },
      { id: "review", label: "Code review", kind: "note", sub: "started too", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "ismail", to: "ledger", label: "bug tracker" },
      { kind: "say", at: 1.4, actor: "ledger", text: "5 releases each", tone: "accent" },
      { kind: "fly", at: 2.4, dur: 1.0, from: "ismail", to: "mentor", label: "my checklist" },
      { kind: "say", at: 3.5, actor: "review", text: "same period", tone: "warn" },
      { kind: "say", at: 4.0, actor: "mentor", text: "believes him", tone: "good" },
      { kind: "verdict", at: 4.7, text: "A shared drop, shown honestly", tone: "good" },
    ],
    loop: 8.5,
  },
};
