import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.2 beat 5: The ten-second test.
// You can test your own kit: a partner looks at your phone for ten seconds, then says what they remember, and you compare it with your best proof.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1TenSecondTest: SceneSpec = {
  kind: "scene",
  title: "The ten-second test",
  purpose: "A partner looks at your resume on a phone for ten seconds, then says what they remember. You write it down and check it against your best proof.",
  limits: "The ten seconds are a practice limit chosen by this course. They are not a research finding and not how long a real reader looks.",
  hint: "Run this test on your own kit at the end of the module.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "partner", label: "Partner", kind: "user", sub: "ten-second look", x: 62, y: 110 },
      { id: "phone", label: "Your phone", kind: "phone", sub: "your resume", x: 358, y: 110 },
      { id: "notes", label: "Your notes", kind: "note", sub: "what stuck", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "partner", to: "phone", label: "look" },
      { kind: "wait", at: 1.4, dur: 3, actor: "partner", label: "looking {n} s", doneLabel: "time up", total: 10 },
      { kind: "say", at: 4.5, actor: "partner", text: "recalls two", tone: "accent" },
      { kind: "fly", at: 4.7, dur: 1, from: "partner", to: "notes", label: "what stuck" },
      { kind: "say", at: 5.8, actor: "notes", text: "write it down", tone: "good" },
      { kind: "verdict", at: 6.4, text: "Was your best proof one of them?", tone: "accent" },
    ],
    loop: 10.5,
  },
};
