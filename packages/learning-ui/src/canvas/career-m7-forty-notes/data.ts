import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.1 beat 1: Amjad sends the same note to forty founders he does not know. No replies; his invitations are restricted for about a week. Card register. Amjad is fictional; platform facts checked 2026-10.
export const careerM7FortyNotes: SceneSpec = {
  kind: "scene",
  title: "Forty identical notes",
  purpose: "Amjad, whose headline reads 'Passionate developer | Lifelong learner', sends 40 identical notes to founders he does not know. There are no replies, and his invitations are restricted for about a week.",
  limits: "Platform rules change; checked 2026-10, and if your screen differs, follow your screen. Only four of the forty notes are drawn.",
  hint: "Watch the same note leave again and again.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "amjad", label: "Amjad", kind: "user", sub: "same note x40", x: 62, y: 110 },
      { id: "founders", label: "Founders", kind: "user", sub: "strangers", x: 358, y: 110 },
      { id: "banner", label: "Restriction", kind: "note", sub: "about a week", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "amjad", to: "founders", label: "same note" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "amjad", to: "founders", label: "same note" },
      { kind: "fly", at: 2.1, dur: 0.8, from: "amjad", to: "founders", label: "same note" },
      { kind: "fly", at: 3, dur: 0.8, from: "amjad", to: "founders", label: "same note" },
      { kind: "say", at: 3.9, actor: "founders", text: "no replies", tone: "bad" },
      { kind: "say", at: 4.4, actor: "banner", text: "invites limited", tone: "bad" },
      { kind: "verdict", at: 5, text: "Forty identical notes, no replies", tone: "bad" },
    ],
    loop: 9,
  },
};
