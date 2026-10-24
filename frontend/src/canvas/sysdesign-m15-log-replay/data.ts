import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.3 beat 5: A reader rewinds to event 40 and reads again.
export const sysdesignM15LogReplay: SceneSpec = {
  kind: "scene",
  title: "A reader rewinds to event 40 and reads again",
  purpose: "The Stats reader had a bug and counted wrongly. The log still holds events 40 to 100, so the reader moves its position back to 40 and reads them again.",
  limits: "A log keeps events only for its retention period (7 days here is a course number). A queue cannot do this, because it deleted each job after the ack.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "log", label: "Log", kind: "queue", sub: "keeps 7 days", x: 210, y: 110 },
      { id: "stats", label: "Stats", kind: "worker", sub: "at 100", x: 210, y: 215 },
    ],
    events: [
      { kind: "say", at: 0.4, actor: "stats", text: "bug found", tone: "bad" },
      { kind: "say", at: 1.5, actor: "stats", text: "rewind to 40", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "stats", to: "log", label: "from 40" },
      { kind: "fly", at: 3.4, dur: 1.3, from: "log", to: "stats", label: "events 40-100" },
      { kind: "say", at: 5, actor: "stats", text: "at 100 again", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Rewind to 40 and process again", tone: "good" },
    ],
    loop: 8.4,
  },
};
