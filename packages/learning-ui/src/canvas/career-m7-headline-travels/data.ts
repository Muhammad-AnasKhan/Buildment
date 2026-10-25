import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.2 beat 1: the headline sits under your name and shows again in a search result. Card register; checked 2026-10.
export const careerM7HeadlineTravels: SceneSpec = {
  kind: "scene",
  title: "The headline travels with your name",
  purpose: "The headline sits under your name on your profile and shows again, beside your name, in a search result. A reader meets its first words in both places.",
  limits: "Checked 2026-10; if your screen differs, follow your screen. LinkedIn's page gives no length rule for the headline, so do not trust a list that gives one. The picture is simplified.",
  hint: "One line, two places.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "profile", label: "Profile", kind: "note", sub: "name + headline", x: 62, y: 110 },
      { id: "search", label: "Search result", kind: "note", sub: "same headline", x: 358, y: 110 },
      { id: "reader", label: "Reader", kind: "user", sub: "scans names", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.1, from: "profile", to: "search", label: "headline travels" },
      { kind: "fly", at: 1.8, dur: 1, from: "search", to: "reader", label: "first words" },
      { kind: "say", at: 3, actor: "reader", text: "will click", tone: "accent" },
      { kind: "verdict", at: 3.8, text: "The headline travels with your name", tone: "accent" },
    ],
    loop: 7.5,
  },
};
