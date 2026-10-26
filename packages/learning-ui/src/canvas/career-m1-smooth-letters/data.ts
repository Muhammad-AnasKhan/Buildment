import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.4 beat 2: When everyone writes smoothly, smooth proves less.
// When anyone can produce a smooth cover letter in a minute, a smooth letter proves less. Readers lean on things they can check: what you built, what the numbers were, who vouches for it.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1SmoothLetters: SceneSpec = {
  kind: "scene",
  title: "When everyone writes smoothly, smooth proves less",
  purpose: "A reader meets a stack of smooth, polished letters that all sound alike. The reader looks elsewhere and checks the one line that holds a result.",
  limits: "Read at the level of direction only. After an AI cover-letter tool arrived on one platform, the link between how well a letter matched the job and callbacks (replies asking for an interview) fell, and employers leaned more on other signals such as work history. Do not quote the percentages from those papers.",
  hint: "Watch where the reader looks when every letter sounds the same.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "letters", label: "Letters", kind: "note", sub: "all sound alike", x: 62, y: 110 },
      { id: "reader", label: "Reader", kind: "user", sub: "many letters", x: 358, y: 110 },
      { id: "result", label: "A result line", kind: "note", sub: "can be checked", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "letters", to: "reader", label: "smooth, polished" },
      { kind: "say", at: 1.4, actor: "reader", text: "all alike", tone: "warn" },
      { kind: "fly", at: 2.6, dur: 1, from: "reader", to: "result", label: "look here" },
      { kind: "say", at: 3.7, actor: "result", text: "a real number", tone: "good" },
      { kind: "say", at: 4, actor: "reader", text: "checks it", tone: "good" },
      { kind: "verdict", at: 4.7, text: "A line they can check gets noticed", tone: "good" },
    ],
    loop: 8.5,
  },
};
