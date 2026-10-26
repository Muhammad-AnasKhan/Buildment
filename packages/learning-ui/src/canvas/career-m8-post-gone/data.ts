import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.1 beat 1: Diala's only copy of her CI post lived on one blogging site; when she lost her account there, the post and her resume link went too.
// Fictional people only. No dashes.

export const careerM8PostGone: SceneSpec = {
  kind: "scene",
  title: "Her best post, gone",
  purpose: "Diala wrote a strong post about cutting her team's CI pipeline from 22 minutes to 9. It lived on one blogging site. When she lost access to her account there, the post went too, and the link on her resume broke.",
  limits: "The blogging site is not named. Platforms change their rules and can lock accounts; that is why the original belongs on a page you control.",
  hint: "One copy, on a site she did not control.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "diala",
        label: "Diala",
        kind: "user",
        sub: "DevOps engineer",
        x: 62,
        y: 110
      },
      {
        id: "platform",
        label: "Blog site",
        kind: "server",
        sub: "her only copy",
        x: 358,
        y: 110
      },
      {
        id: "resume",
        label: "Resume link",
        kind: "note",
        sub: "points there",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "diala",
        to: "platform",
        label: "CI: 22 to 9 min"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "platform",
        text: "account lost",
        tone: "bad"
      },
      {
        kind: "say",
        at: 2.2,
        actor: "resume",
        text: "link broken",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 3,
        text: "Her best post is gone",
        tone: "bad"
      }
    ],
    loop: 7
  }
};
