import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.2 beat 4: a job takes 400 ms. The wall clock is stepped back 1 s while
// it runs, so the wall clock measures -600 ms; the monotonic clock is right.
export const sysdesignM10WallVsMonotonic: SceneSpec = {
  kind: "scene",
  title: "A clock step makes a job take negative time",
  purpose: "A 400 ms job is timed with the wall clock and with a monotonic clock while the wall clock is stepped back by one second.",
  limits: "The 1 second step stands for a time correction, an administrator changing the time, or a repeated leap second. Most steps are smaller. A monotonic clock cannot tell you the date; it only counts time passing.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "wall", label: "Wall clock", kind: "clock", sub: "can jump back", x: 70, y: 100 },
      { id: "job", label: "Job", kind: "worker", sub: "starts", x: 210, y: 100 },
      { id: "mono", label: "Monotonic", kind: "clock", sub: "only forward", x: 350, y: 100 },
    ],
    strip: { y: 300, from: -800, to: 800, unit: "ms", caption: "measured duration", every: 400 },
    events: [
      { kind: "say", at: 0.3, actor: "job", text: "running" },
      { kind: "say", at: 1.2, actor: "wall", text: "stepped -1 s", tone: "warn" },
      { kind: "mark", at: 1.2, actor: "wall", tone: "warn" },
      { kind: "say", at: 2.2, actor: "job", text: "done in 400 ms", tone: "good" },
      { kind: "tag", at: 2.6, row: 0, value: -600, label: "wall -600 ms", tone: "bad" },
      { kind: "say", at: 2.6, actor: "wall", text: "end - start < 0", tone: "bad" },
      { kind: "tag", at: 3.2, row: 1, value: 400, label: "mono +400 ms", tone: "good" },
      { kind: "say", at: 3.2, actor: "mono", text: "400 ms", tone: "good" },
      { kind: "verdict", at: 3.8, text: "Wall clock: a negative duration", tone: "bad" },
    ],
    loop: 7.4,
  },
};
