import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 5.1, beat 1: Hadi (fictional) takes one fast answer
// about a PDF library, builds on it for 2 days, and loses 5 days when the
// library turns out to be abandoned. The library, pdfwand, is invented.
// Working days are counted from the question (day 0).
export const fastAnswerLostWeek: SceneSpec = {
  kind: "scene",
  title: "One fast answer, then five lost days",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  purpose:
    "Hadi asks an assistant which library to use. The answer comes at once. He builds on it for 2 days, the build breaks on day 3, and he spends days 3 to 7 replacing the library. The strip counts the working days.",
  limits:
    "A made-up case. Hadi, his agency and the library pdfwand are fictional, and the days are this example's own numbers. Nothing here says the assistant was careless: the point is that nobody checked the answer before the team built on it.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "hadi", label: "Hadi", kind: "user", sub: "quoted 2 days", x: 60, y: 100 },
      { id: "ai", label: "Assistant", kind: "server", sub: "answers fast", x: 360, y: 100 },
      { id: "lib", label: "pdfwand", kind: "note", sub: "library", x: 210, y: 185 },
    ],
    strip: { y: 300, from: 0, to: 8, unit: "days", caption: "working days after the question", every: 1 },
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "hadi", to: "ai", label: "which library?" },
      { kind: "tag", at: 0.4, row: 0, value: 0, label: "asked" },
      { kind: "fly", at: 1.6, dur: 1.0, from: "ai", to: "hadi", label: "use pdfwand" },
      { kind: "say", at: 2.6, actor: "hadi", text: "builds 2 days", tone: "good" },
      { kind: "tag", at: 3.0, row: 1, value: 2, label: "built", tone: "good" },
      { kind: "say", at: 4.0, actor: "lib", text: "4 years old", tone: "bad" },
      { kind: "mark", at: 4.0, actor: "lib", tone: "bad" },
      { kind: "fly", at: 4.2, dur: 0.9, from: "lib", to: "hadi", label: "build breaks", tone: "bad" },
      { kind: "tag", at: 5.1, row: 0, value: 3, label: "breaks", tone: "bad" },
      { kind: "say", at: 5.4, actor: "hadi", text: "replaces it", tone: "warn" },
      { kind: "tag", at: 6.0, row: 1, value: 7, label: "replaced", tone: "warn" },
      { kind: "verdict", at: 6.6, text: "One fast answer cost 5 extra days", tone: "bad" },
    ],
    loop: 10,
  },
};
