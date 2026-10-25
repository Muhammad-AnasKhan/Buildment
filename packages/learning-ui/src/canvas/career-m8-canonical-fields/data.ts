import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.3 beat 3: DEV, Medium and LinkedIn each point back to your page in their own way. Checked 2026-10.
// Fictional people only. No dashes.

export const careerM8CanonicalFields: SceneSpec = {
  kind: "scene",
  title: "Where a canonical field exists",
  purpose: "DEV points back to your page with canonical_url. Medium marks a story as originally published elsewhere. LinkedIn gets a short version with a link. All three lead home.",
  limits: "Checked 2026-10; if your screen differs, follow your screen. Hashnode and Substack settings are unverified, so the course relies on the 'first published at' line. Access from Gaza to these platforms is not confirmed: test early, ask your mentor, never use a VPN.",
  hint: "Three ways back to your page.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "dev",
        label: "DEV",
        kind: "note",
        sub: "canonical_url",
        x: 62,
        y: 105
      },
      {
        id: "medium",
        label: "Medium",
        kind: "note",
        sub: "set elsewhere",
        x: 210,
        y: 105
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        kind: "note",
        sub: "short + link",
        x: 358,
        y: 105
      },
      {
        id: "site",
        label: "Your site",
        kind: "note",
        sub: "the original",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "dev",
        to: "site",
        label: "canonical_url"
      },
      {
        kind: "fly",
        at: 1.5,
        dur: 1,
        from: "medium",
        to: "site",
        label: "set as original"
      },
      {
        kind: "fly",
        at: 2.7,
        dur: 1,
        from: "linkedin",
        to: "site",
        label: "link home"
      },
      {
        kind: "say",
        at: 3.9,
        actor: "site",
        text: "all lead here",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.5,
        text: "Use the field if it exists",
        tone: "good"
      }
    ],
    loop: 8.5
  }
};
