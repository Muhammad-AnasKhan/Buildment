import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.1 beat 2: in an interview Sireen is asked how the matching works and cannot explain code an AI wrote.
// Fictional people; the picture is a story, not data.
export const careerM4MatchingQuestion: SceneSpec = {
  kind: "scene",
  title: "\"How does the matching work?\"",
  purpose: "In an interview, Sireen is asked how the matching works in her ride app. She scrolls through code an AI tool wrote and cannot explain it.",
  limits: "Sireen is a fictional fellow. The picture does not claim every interviewer asks this. It shows what happens when someone does.",
  hint: "One question, no answer.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "asks", x: 62, y: 110 },
      { id: "sireen", label: "Sireen", kind: "user", sub: "interviewing", x: 358, y: 110 },
      { id: "code", label: "The code", kind: "note", sub: "an AI wrote it", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "interviewer", to: "sireen", label: "how does it match?" },
      { kind: "fly", at: 1.6, dur: 1, from: "sireen", to: "code", label: "scrolls" },
      { kind: "say", at: 2.7, actor: "code", text: "not her words", tone: "warn" },
      { kind: "say", at: 3.4, actor: "sireen", text: "cannot explain", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "She could not explain her own app", tone: "bad" },
    ],
    loop: 8,
  },
};
