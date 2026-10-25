import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 8.1, beat 1: a mentor with ten minutes opens Laith's
// profile (a fictional fellow, a year after the course) and finds forty
// tutorial repositories. One question about a design choice has no answer in
// the repository. Watch-only scene.
export const growLaithFortyRepos: SceneSpec = {
  kind: "scene",
  title: "Forty repositories, one question",
  purpose: "A mentor with ten minutes opens Laith's profile, opens one repository and asks why it was built that way. The repository has no answer.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits:
    "A made-up fellow and a made-up mentor. Many people with many repositories do explain their choices; the picture shows what happens when forty repositories hold no reasons. Neither Laith nor Mira is a real person.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "mentor", label: "Mentor", kind: "user", sub: "has 10 minutes", x: 68, y: 170 },
      { id: "profile", label: "Laith", kind: "note", sub: "a year of work", x: 330, y: 96 },
      { id: "repo", label: "Repo 17", kind: "note", sub: "tutorial clone", x: 330, y: 244 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "mentor", to: "profile", label: "open" },
      { kind: "say", at: 1.2, actor: "profile", text: "40 tutorials", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "mentor", to: "repo", label: "open one" },
      { kind: "say", at: 3.1, actor: "repo", text: "one-line README", tone: "warn" },
      { kind: "fly", at: 4.0, dur: 0.9, from: "mentor", to: "repo", label: "why this design?" },
      { kind: "say", at: 4.9, actor: "repo", text: "no reasons", tone: "bad" },
      { kind: "say", at: 5.0, actor: "mentor", text: "cannot check", tone: "bad" },
      { kind: "verdict", at: 5.6, text: "40 repos, no reasons to check", tone: "bad" },
    ],
    loop: 8.4,
  },
};
