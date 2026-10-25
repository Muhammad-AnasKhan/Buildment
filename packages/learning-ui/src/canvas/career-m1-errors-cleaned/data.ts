import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.4 beat 1: Fixing mistakes helped in one study.
// Writing help that fixes mistakes has been linked to more hires in one large study. The help corrected errors; it did not invent claims.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1ErrorsCleaned: SceneSpec = {
  kind: "scene",
  title: "Fixing mistakes helped in one study",
  purpose: "A resume with errors goes to an error fixer and comes back clean. Employers hire a little more. The tool corrected mistakes; it wrote no new claims.",
  limits: "One field experiment with nearly half a million jobseekers on one platform found about 8 percent more hires with no drop in employer satisfaction. Two of the authors have ties to the platform. It does not show that writing help of every kind helps.",
  hint: "The fixer changes mistakes, not facts.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "resume", label: "Resume", kind: "note", sub: "has errors", x: 62, y: 110 },
      { id: "fixer", label: "Error fixer", kind: "worker", sub: "fixes mistakes", x: 358, y: 110 },
      { id: "employers", label: "Employers", kind: "user", sub: "reading", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "resume", to: "fixer", label: "errors" },
      { kind: "say", at: 1.4, actor: "fixer", text: "fixes errors", tone: "accent" },
      { kind: "fly", at: 2, dur: 1, from: "fixer", to: "resume", label: "clean copy" },
      { kind: "say", at: 3.1, actor: "resume", text: "no errors", tone: "good" },
      { kind: "fly", at: 3.6, dur: 1, from: "resume", to: "employers", label: "applies" },
      { kind: "say", at: 4.7, actor: "employers", text: "hire a bit more", tone: "good" },
      { kind: "verdict", at: 5.3, text: "Fixing mistakes helped in one study", tone: "accent" },
    ],
    loop: 9,
  },
};
