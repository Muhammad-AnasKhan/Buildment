import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.2 beat 3: a pile of look-alike weekend apps and one project with a user, a number and a reason (an inference, not a finding).
// Fictional people; the picture is a story, not data.
export const careerM4PileOfApps: SceneSpec = {
  kind: "scene",
  title: "A working app alone proves less",
  purpose: "A reader meets a pile of near-identical weekend apps. One project stands out because it carries a real user, a number and a written decision.",
  limits: "This is an inference, not a measured finding: if a working app is cheap to make, it says less about the maker. The picture does not say building is pointless; it says the build is not the proof.",
  hint: "One project among many.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "pile", label: "Weekend apps", kind: "note", sub: "look alike", x: 62, y: 110 },
      { id: "project", label: "This project", kind: "note", sub: "user and number", x: 358, y: 110 },
      { id: "reader", label: "Reader", kind: "user", sub: "looking", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "pile", to: "reader", label: "all alike" },
      { kind: "say", at: 1.4, actor: "reader", text: "moves on", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 1, from: "project", to: "reader", label: "a real user" },
      { kind: "fly", at: 3.6, dur: 1, from: "project", to: "reader", label: "a number" },
      { kind: "fly", at: 4.8, dur: 1, from: "project", to: "reader", label: "a decision, why" },
      { kind: "say", at: 6, actor: "reader", text: "stops here", tone: "good" },
      { kind: "verdict", at: 6.5, text: "A user, a number and a reason", tone: "good" },
    ],
    loop: 10,
  },
};
