import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 9.1 (set the scene): two visitors open the same
// repository of Bashar's study-group timer (fictional). The first finds a
// one-line README and leaves. The second finds a picture and a short demo,
// and understands. The code is the same in both. No dossier claim.
export const toolbeltOneLineReadme: SceneSpec = {
  kind: "scene",
  title: "Same code, two visitors",
  purpose: "A visitor opens a repository with a one-line README and leaves unsure; a second visitor opens the same repository with a picture and a short demo and understands it.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits:
    "A made-up case with made-up visitors. Showing your work does not promise that anyone will use it. It lets a stranger decide in a minute, instead of guessing.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "visitor", label: "Visitor", kind: "user", sub: "new visitor", x: 90, y: 110 },
      { id: "repo", label: "Repository", kind: "note", sub: "one line", x: 330, y: 110 },
      { id: "demo", label: "Demo", kind: "phone", sub: "none yet", x: 330, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "visitor", to: "repo", label: "opens link" },
      { kind: "say", at: 1.2, actor: "repo", text: "'A timer'", tone: "warn" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "repo", to: "visitor", label: "one line" },
      { kind: "say", at: 2.4, actor: "visitor", text: "no idea", tone: "bad" },
      { kind: "verdict", at: 2.6, text: "Visitor leaves, unsure", tone: "bad" },

      { kind: "say", at: 5.0, actor: "visitor", text: "new visitor" },
      { kind: "say", at: 5.0, actor: "repo", text: "picture + demo", tone: "good" },
      { kind: "say", at: 5.0, actor: "demo", text: "40 s recording", tone: "good" },
      { kind: "verdict", at: 5.0, text: "Same code, new visitor", tone: "accent" },
      { kind: "fly", at: 5.3, dur: 0.9, from: "visitor", to: "repo", label: "opens link" },
      { kind: "fly", at: 6.4, dur: 0.9, from: "repo", to: "visitor", label: "picture" },
      { kind: "fly", at: 7.5, dur: 1.1, from: "visitor", to: "demo", label: "taps demo" },
      { kind: "say", at: 8.7, actor: "visitor", text: "gets it", tone: "good" },
      { kind: "verdict", at: 8.9, text: "Understands, tries it", tone: "good" },
    ],
    loop: 12,
  },
};
