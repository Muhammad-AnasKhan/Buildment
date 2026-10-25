import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.4 beat 1: an asker who expects a no gets a yes more often than expected. Card register; the figure is a range across studies, so no bars are drawn.
export const careerM7MoreYes: SceneSpec = {
  kind: "scene",
  title: "People say yes more than you expect",
  purpose: "An asker expects a no and sends a small, direct request. The other person says yes. In studies of asking for help, people underestimated how often others say yes, by as much as 50 percent in some studies.",
  limits: "A made-up asker. The studies were mostly about small, direct requests, not job offers, and the effect varied. This is a reason to send the message, not a promise of a reply.",
  hint: "A small, direct ask.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "asker", label: "Asker", kind: "user", sub: "expects a no", x: 62, y: 120 },
      { id: "others", label: "Others", kind: "user", sub: "often say yes", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.2, from: "asker", to: "others", label: "small direct ask" },
      { kind: "fly", at: 1.8, dur: 1.2, from: "others", to: "asker", label: "yes" },
      { kind: "say", at: 3.1, actor: "asker", text: "surprised", tone: "good" },
      { kind: "verdict", at: 3.8, text: "People say yes more than you expect", tone: "good" },
    ],
    loop: 7.5,
  },
};
