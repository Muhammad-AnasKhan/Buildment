import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.3 beat 6: A good kit cannot remove every bias.
// A stronger kit helps, but it does not erase every unfairness. The course does not promise that a better kit removes bias against a name, a place or a passport.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1KitBiasNote: SceneSpec = {
  kind: "scene",
  title: "A good kit cannot remove every bias",
  purpose: "Two kits carry the same proof. A reader reads both. One gets a reply and one does not. A better kit helps, but not equally for everyone.",
  limits: "This shows one old finding: in a 2004 US study of newspaper job ads, white-sounding names got about 50 percent more callbacks (replies asking for an interview), and a better resume helped them far more. It is old and about US ads, so it predicts nothing about remote hiring today. No study we found measures applicants from where you are. Mentors can help you choose where to apply.",
  hint: "Two equal kits, one reader.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "a", label: "Kit A", kind: "note", sub: "same proof", x: 62, y: 110 },
      { id: "b", label: "Kit B", kind: "note", sub: "same proof", x: 358, y: 110 },
      { id: "reader", label: "Reader", kind: "user", sub: "reads both", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "a", to: "reader", label: "kit" },
      { kind: "fly", at: 1.5, dur: 1, from: "b", to: "reader", label: "kit" },
      { kind: "say", at: 2.8, actor: "a", text: "reply", tone: "good" },
      { kind: "say", at: 3.4, actor: "b", text: "no reply", tone: "warn" },
      { kind: "verdict", at: 4.2, text: "Quality helps, but not equally for all", tone: "warn" },
    ],
    loop: 8,
  },
};
