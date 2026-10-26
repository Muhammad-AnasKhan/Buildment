import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.3 beat 2: guide claims with no first-party source, and what LinkedIn's own page says. Card register; checked 2026-10.
export const careerM7FolkloreCards: SceneSpec = {
  kind: "scene",
  title: "Folklore, and what LinkedIn says",
  purpose: "Guides say the first hour decides and links are punished. Neither has a first-party source. LinkedIn's own page says to be relevant and to comment on others' posts.",
  limits: "Checked 2026-10; if your screen differs, follow your screen. The cards are examples of common claims. Nobody outside LinkedIn can give a reliable recipe, and the page's tips are general, not a guarantee.",
  hint: "Two sources, one reader.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "guides", label: "Guides", kind: "note", sub: "exact numbers", x: 62, y: 110 },
      { id: "linkedin", label: "LinkedIn", kind: "note", sub: "relate, comment", x: 358, y: 110 },
      { id: "reader", label: "You", kind: "user", sub: "who to trust", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "guides", to: "reader", label: "first hour decides" },
      { kind: "fly", at: 1.5, dur: 1, from: "guides", to: "reader", label: "links are punished" },
      { kind: "say", at: 2.7, actor: "reader", text: "no source", tone: "warn" },
      { kind: "fly", at: 3.4, dur: 1, from: "linkedin", to: "reader", label: "be relevant" },
      { kind: "fly", at: 4.6, dur: 1, from: "linkedin", to: "reader", label: "comment on posts" },
      { kind: "say", at: 5.8, actor: "reader", text: "trust the page", tone: "good" },
      { kind: "verdict", at: 6.4, text: "Treat exact numbers as guesses", tone: "good" },
    ],
    loop: 10,
  },
};
