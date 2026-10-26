import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.3 beat 3: Sireen's reshaped idea, a pickup schedule for one driver and 14 families, useful on day one.
// Fictional people; the picture is a story, not data.
export const careerM4BusSchedule: SceneSpec = {
  kind: "scene",
  title: "Useful with one user",
  purpose: "Sireen reshapes her idea into a pickup schedule for her cousin's school bus run. There is one driver she knows and 14 families, and the schedule is useful on day one.",
  limits: "One practitioner essay argues that many network products began with a mode that was useful without other users; that is an essay, not a study. A small known group on day one is the second safe shape.",
  hint: "One driver, 14 families, day one.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "sireen", label: "Sireen", kind: "user", sub: "reshaped idea", x: 62, y: 105 },
      { id: "app", label: "Schedule", kind: "phone", sub: "for one bus run", x: 358, y: 105 },
      { id: "driver", label: "One driver", kind: "user", sub: "she knows him", x: 62, y: 250 },
      { id: "families", label: "14 families", kind: "user", sub: "see the times", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "sireen", to: "app", label: "bus run times" },
      { kind: "fly", at: 1.6, dur: 1, from: "app", to: "driver", label: "today's route" },
      { kind: "fly", at: 2.9, dur: 1, from: "app", to: "families", label: "pickup times" },
      { kind: "say", at: 4, actor: "driver", text: "uses it", tone: "good" },
      { kind: "say", at: 4.2, actor: "families", text: "use it", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Useful on day one, with one driver", tone: "good" },
    ],
    loop: 8.5,
  },
};
