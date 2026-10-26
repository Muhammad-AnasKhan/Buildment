import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.1 beat 2: What the founder's phone showed.
// On a phone the first screen of Bashar's resume is his name, an objective paragraph and half a skills block. His best work is on page 2, far below.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1FoundersPhone: SceneSpec = {
  kind: "scene",
  title: "What the founder's phone showed",
  purpose: "A founder opens Bashar's two-page resume on a phone. The first screen holds his name, an objective paragraph and half a skills block. The import he moved into a queue sits on page 2.",
  limits: "Bashar is a fictional fellow. The picture shows the order of his resume, not how long any real reader looks. His agency is not named.",
  hint: "Watch what the founder sees before scrolling.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "founder", label: "Founder", kind: "user", sub: "opens it", x: 62, y: 120 },
      { id: "phone", label: "First screen", kind: "phone", sub: "name first", x: 210, y: 255 },
      { id: "resume", label: "Resume", kind: "note", sub: "2 pages", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "founder", to: "resume", label: "open file" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "resume", to: "phone", label: "first screen" },
      { kind: "say", at: 2.3, actor: "phone", text: "name, objective", tone: "warn" },
      { kind: "say", at: 3.3, actor: "phone", text: "half the skills", tone: "warn" },
      { kind: "say", at: 4, actor: "resume", text: "best work: p.2", tone: "bad" },
      { kind: "mark", at: 4, actor: "resume", tone: "bad" },
      { kind: "verdict", at: 4.8, text: "The best work is far below", tone: "bad" },
    ],
    loop: 8.5,
  },
};
