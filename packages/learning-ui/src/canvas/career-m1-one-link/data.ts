import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.2 beat 4: One labelled link, not thirty repositories.
// A reader given 31 repositories gives up; a reader given one link that says what they will see opens it.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1OneLink: SceneSpec = {
  kind: "scene",
  title: "One labelled link, not thirty repositories",
  purpose: "A reader opens a profile with 31 repositories, mostly tutorial copies, and gives up. Then the reader meets one link labelled with what it shows and opens it.",
  limits: "Bashar is a fictional fellow. People who judge developers online look at what you did over time and who you worked with, not at a count of green squares. The picture does not claim every reader behaves this way.",
  hint: "Watch the same reader twice.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "reader", label: "Reader", kind: "user", sub: "has a minute", x: 62, y: 190 },
      { id: "repos", label: "GitHub", kind: "database", sub: "31 repos", x: 358, y: 105 },
      { id: "link", label: "Labelled link", kind: "note", sub: "what you'll see", x: 358, y: 265 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "reader", to: "repos", label: "open one" },
      { kind: "say", at: 1.4, actor: "repos", text: "tutorial copies", tone: "warn" },
      { kind: "say", at: 2, actor: "reader", text: "gives up", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 1, from: "reader", to: "link", label: "open it" },
      { kind: "say", at: 4.3, actor: "link", text: "import code", tone: "good" },
      { kind: "say", at: 4.6, actor: "reader", text: "sees the proof", tone: "good" },
      { kind: "verdict", at: 5.2, text: "One clear link gets opened", tone: "good" },
    ],
    loop: 9,
  },
};
