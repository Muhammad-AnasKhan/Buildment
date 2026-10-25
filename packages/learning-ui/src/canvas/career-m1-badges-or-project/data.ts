import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.3 beat 2: Shipped work over a list of courses.
// Founders who write about hiring say they would rather see something you built than a list of courses. That is their stated practice, not a law.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1BadgesOrProject: SceneSpec = {
  kind: "scene",
  title: "Shipped work over a list of courses",
  purpose: "A reader looks at a profile headed by eight course badges and one headed by a shipped project with a result. The reader opens the project.",
  limits: "A made-up reader. Some founders and companies say they prefer real work to credentials; that is their own stated practice, not a measurement. Courses can still be useful to you as a learner.",
  hint: "Watch where the reader's attention goes.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "reader", label: "Reader", kind: "user", sub: "two profiles", x: 210, y: 105 },
      { id: "badges", label: "Eight badges", kind: "note", sub: "no project", x: 62, y: 250 },
      { id: "project", label: "Shipped work", kind: "note", sub: "has a result", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "reader", to: "badges", label: "look" },
      { kind: "say", at: 1.4, actor: "reader", text: "skims badges", tone: "warn" },
      { kind: "fly", at: 2.6, dur: 1, from: "reader", to: "project", label: "look" },
      { kind: "say", at: 3.7, actor: "reader", text: "opens project", tone: "good" },
      { kind: "mark", at: 3.7, actor: "project", tone: "good" },
      { kind: "verdict", at: 4.4, text: "The shipped project gets opened", tone: "good" },
    ],
    loop: 8,
  },
};
