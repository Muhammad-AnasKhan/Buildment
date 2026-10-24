import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.6 beat 3 ("A copy that is down sets the clock"). Eventually has no deadline: a copy that is down keeps the others from agreeing.
export const sysdesignM11NoDeadline: SceneSpec = {
  kind: "scene",
  title: "One copy is down, so nobody can say when",
  purpose: "Copies A and B agree in 2 seconds. Copy C is down until second 48. Only then do all three agree.",
  limits: "Three copies and one failure. The numbers are made up. A real outage can last seconds or hours, which is exactly why there is no promised time.",
  scene: {
    width: 420,
    height: 360,
    actors: [
      { id: "a", label: "Copy A", kind: "database", sub: "x = 5", x: 70, y: 100 },
      { id: "b", label: "Copy B", kind: "database", sub: "x = 0", x: 350, y: 100 },
      { id: "c", label: "Copy C", kind: "database", sub: "x = 0", x: 210, y: 205 },
    ],
    strip: { y: 330, from: 0, to: 60, unit: "s", caption: "seconds since the write", every: 10 },
    events: [
      { kind: "say", at: 0.2, actor: "c", text: "down", tone: "bad" },
      { kind: "mark", at: 0.2, actor: "c", tone: "bad" },
      { kind: "fly", at: 0.6, dur: 1, from: "a", to: "b", label: "sync" },
      { kind: "say", at: 1.6, actor: "b", text: "x = 5", tone: "good" },
      { kind: "tag", at: 1.7, row: 0, value: 2, label: "A and B agree", tone: "good" },
      { kind: "say", at: 3.2, actor: "c", text: "back up", tone: "good" },
      { kind: "tag", at: 3.2, row: 1, value: 48, label: "C back at 48", tone: "warn" },
      { kind: "fly", at: 3.5, dur: 1, from: "a", to: "c", label: "sync" },
      { kind: "say", at: 4.5, actor: "c", text: "x = 5", tone: "good" },
      { kind: "tag", at: 4.6, row: 0, value: 50, label: "all three agree", tone: "good" },
      { kind: "verdict", at: 4.7, text: "No deadline while a copy is down", tone: "warn" },
    ],
    loop: 8,
  },
};
