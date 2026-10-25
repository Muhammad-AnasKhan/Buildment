import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.4 beat 3: People cannot reliably spot AI text.
// Nobody can reliably tell whether a profile was written with AI, not even the people who try. So the useful question is not "will they catch me" but "does this say anything only I could say".
// Card register. Fictional people; the picture is a story, not data.
export const careerM1GuessTheWriter: SceneSpec = {
  kind: "scene",
  title: "People cannot reliably spot AI text",
  purpose: "A reader guesses whether two profiles were written by a person or by AI. The guesses are about as good as chance.",
  limits: "Two guesses are a story, not data. In six experiments with 4,600 participants, people could not reliably detect AI-written self-presentations and relied on unreliable cues such as pronouns and contractions. Vendor surveys on this disagree with each other; do not quote them.",
  hint: "Watch the reader guess twice.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "reader", label: "Reader", kind: "user", sub: "guessing", x: 210, y: 105 },
      { id: "p1", label: "Profile 1", kind: "note", sub: "who wrote it?", x: 62, y: 250 },
      { id: "p2", label: "Profile 2", kind: "note", sub: "who wrote it?", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "reader", to: "p1", label: "human or AI?" },
      { kind: "say", at: 1.4, actor: "reader", text: "guess: human", tone: "accent" },
      { kind: "say", at: 1.9, actor: "p1", text: "a person", tone: "good" },
      { kind: "fly", at: 3, dur: 1, from: "reader", to: "p2", label: "human or AI?" },
      { kind: "say", at: 4.1, actor: "reader", text: "guess: human", tone: "accent" },
      { kind: "say", at: 4.6, actor: "p2", text: "AI wrote it", tone: "bad" },
      { kind: "say", at: 5.2, actor: "reader", text: "one of each", tone: "warn" },
      { kind: "verdict", at: 5.6, text: "Guesses are about as good as chance", tone: "warn" },
    ],
    loop: 9.5,
  },
};
