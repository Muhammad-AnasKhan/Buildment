import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 5.2, beat 3: an answer can be older than the rule it
// describes. The assistant's text ends at an example date; the Hacktoberfest
// 2026 rule is newer. The strip counts months from January 2025. The date for
// the assistant is an invented example (B3, B4); the rule change is B69.
export const firstOrResearchedAnswerDates: SceneSpec = {
  kind: "scene",
  title: "The rule is newer than the answer",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  purpose:
    "An example assistant learned from text that ends in 2025. Hacktoberfest 2026 changed its rules in 2026. A question asked in October 2026 gets an answer from the older text, while the program's page shows the 2026 rule.",
  limits:
    "The date the assistant's text ends is an invented example. Real makers publish a date for each model, and one study found that the real date can differ from the published one. Tools that search the web can read newer pages, but their answers still need checking. The strip counts months from January 2025.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "ai", label: "Assistant", kind: "server", sub: "text ends 2025", x: 70, y: 100 },
      { id: "page", label: "Program page", kind: "note", sub: "2026 rules", x: 350, y: 100 },
    ],
    strip: { y: 300, from: 0, to: 24, unit: "months", caption: "months since January 2025", every: 6 },
    events: [
      { kind: "tag", at: 0.4, row: 0, value: 8, label: "text ends (example)" },
      { kind: "mark", at: 0.5, actor: "ai", tone: "warn" },
      { kind: "tag", at: 1.8, row: 1, value: 21, label: "2026 rule", tone: "good" },
      { kind: "mark", at: 1.9, actor: "page", tone: "good" },
      { kind: "line", at: 3.0, value: 21.8, label: "today" },
      { kind: "fly", at: 3.6, dur: 1.2, from: "ai", to: "page", label: "old rule" },
      { kind: "say", at: 4.8, actor: "page", text: "rule changed", tone: "good" },
      { kind: "verdict", at: 5.4, text: "The page is newer than the answer", tone: "warn" },
    ],
    loop: 8.5,
  },
};
