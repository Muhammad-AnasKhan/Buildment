import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.3 beat 2: three copies reach Google and it shows one version. Checked 2026-10.
// Fictional people only. No dashes.

export const careerM8SearchPicksOne: SceneSpec = {
  kind: "scene",
  title: "Search picks one copy, with no penalty",
  purpose: "The same article is on your site and on two platforms. Google sees all three and picks one version to show. It may pick the other site's copy. A canonical link is a hint, not a rule.",
  limits: "Checked 2026-10; if your screen differs, follow your screen. Google calls canonical signals a hint, so expect them to help and not to guarantee anything. Cross-posting is for readers, not a ranking trick.",
  hint: "Three copies, one version shown.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      {
        id: "google",
        label: "Google",
        kind: "server",
        sub: "picks a version",
        x: 210,
        y: 105
      },
      {
        id: "own",
        label: "Your site",
        kind: "note",
        sub: "the original",
        x: 62,
        y: 255
      },
      {
        id: "dev",
        label: "DEV",
        kind: "note",
        sub: "a copy",
        x: 210,
        y: 255
      },
      {
        id: "medium",
        label: "Medium",
        kind: "note",
        sub: "a copy",
        x: 358,
        y: 255
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "own",
        to: "google",
        label: "the article"
      },
      {
        kind: "fly",
        at: 1.5,
        dur: 1,
        from: "dev",
        to: "google",
        label: "a copy"
      },
      {
        kind: "fly",
        at: 2.7,
        dur: 1,
        from: "medium",
        to: "google",
        label: "a copy"
      },
      {
        kind: "say",
        at: 3.9,
        actor: "google",
        text: "shows one",
        tone: "accent"
      },
      {
        kind: "mark",
        at: 3.9,
        actor: "dev",
        tone: "accent"
      },
      {
        kind: "verdict",
        at: 4.6,
        text: "One version is shown, no penalty",
        tone: "good"
      }
    ],
    loop: 8.5
  }
};
