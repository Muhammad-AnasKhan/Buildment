import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.1 beat 1: Sireen builds a ride app in a weekend; the screens are done and nobody has signed up.
// Fictional people; the picture is a story, not data.
export const careerM4RideAppWeekend: SceneSpec = {
  kind: "scene",
  title: "A ride app in one weekend",
  purpose: "Sireen builds a ride-sharing app in a weekend with an AI coding tool. The screens are done. No drivers and no riders have signed up.",
  limits: "Sireen is a fictional fellow. The story is illustrative. It does not say AI tools make apps worse; it says a finished app is not the same as a used one.",
  hint: "A finished app and two empty groups.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "sireen", label: "Sireen", kind: "user", sub: "one weekend", x: 62, y: 105 },
      { id: "app", label: "Ride app", kind: "phone", sub: "screens done", x: 358, y: 105 },
      { id: "riders", label: "Riders", kind: "user", sub: "0 signed up", x: 62, y: 250 },
      { id: "drivers", label: "Drivers", kind: "user", sub: "0 signed up", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "sireen", to: "app", label: "built in a weekend" },
      { kind: "say", at: 1.4, actor: "app", text: "all screens", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1, from: "app", to: "riders", label: "come and ride" },
      { kind: "fly", at: 3.6, dur: 1, from: "app", to: "drivers", label: "come and drive" },
      { kind: "say", at: 4.8, actor: "riders", text: "nobody came", tone: "bad" },
      { kind: "say", at: 5, actor: "drivers", text: "nobody came", tone: "bad" },
      { kind: "verdict", at: 5.6, text: "Built fast, used by nobody", tone: "bad" },
    ],
    loop: 9.5,
  },
};
