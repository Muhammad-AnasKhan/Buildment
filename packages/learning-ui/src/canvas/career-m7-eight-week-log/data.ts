import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.4 beat 6: Areej counts posts, comments, replies and profile views for eight weeks. No result is shown. Card register; Areej is fictional.
export const careerM7EightWeekLog: SceneSpec = {
  kind: "scene",
  title: "Grow slowly, measure eight weeks",
  purpose: "Areej posts once a week and writes five useful comments a week. She logs posts, comments, replies and profile views for eight weeks, then compares. The picture shows the counting, not a result.",
  limits: "No result is shown or promised. The log is your own evidence about your own audience, not a study.",
  hint: "Count for eight weeks, then compare.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "areej", label: "Areej", kind: "user", sub: "logs weekly", x: 62, y: 110 },
      { id: "log", label: "The log", kind: "note", sub: "posts, comments", x: 358, y: 110 },
    ],
    strip: { y: 275, from: 0, to: 8, unit: "wk", caption: "weeks of logging", every: 2 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 1, label: "wk 1: start", tone: "accent" },
      { kind: "fly", at: 0.8, dur: 1, from: "areej", to: "log", label: "post, comments" },
      { kind: "say", at: 2, actor: "log", text: "replies: count", tone: "accent" },
      { kind: "say", at: 2.8, actor: "log", text: "views: count", tone: "accent" },
      { kind: "tag", at: 3.4, row: 0, value: 8, label: "wk 8: compare", tone: "good" },
      { kind: "verdict", at: 4.2, text: "Measure your own eight weeks", tone: "good" },
    ],
    loop: 8,
  },
};
