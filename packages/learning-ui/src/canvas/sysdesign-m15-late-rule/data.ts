import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.6 beat 5: A late event is counted if it is close, set aside if it is not.
export const sysdesignM15LateRule: SceneSpec = {
  kind: "scene",
  title: "A late event is counted if it is close, set aside if it is not",
  purpose: "Window 0 to 60 is closed with a count of 12. An event for the window arrives at watermark 75 and is counted (13). Another arrives at watermark 95, past the 30 second allowed lateness, and is set aside.",
  limits: "An allowed lateness of 30 seconds is a course number. Counting a late event means the window result is sent again with a new number, so readers of the result must expect a correction.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "tablets", label: "Tablets", kind: "phone", sub: "send events", x: 60, y: 100 },
      { id: "counter", label: "Counter", kind: "server", sub: "0-60: 12", x: 360, y: 100 },
      { id: "bin", label: "Late bin", kind: "note", sub: "empty", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 1, from: "tablets", to: "counter", label: "late event" },
      { kind: "say", at: 1.6, actor: "counter", text: "wm 75: 13", tone: "good" },
      { kind: "fly", at: 2.8, dur: 1, from: "tablets", to: "counter", label: "very late" },
      { kind: "say", at: 4, actor: "counter", text: "wm 95: too late", tone: "bad" },
      { kind: "fly", at: 4.2, dur: 0.9, from: "counter", to: "bin", label: "very late", tone: "warn" },
      { kind: "say", at: 5.2, actor: "bin", text: "1 set aside", tone: "warn" },
      { kind: "verdict", at: 5.6, text: "Late data fixed, or set aside", tone: "warn" },
    ],
    loop: 8.6,
  },
};
