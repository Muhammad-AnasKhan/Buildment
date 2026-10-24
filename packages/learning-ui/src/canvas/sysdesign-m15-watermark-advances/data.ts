import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.6 beat 3: The watermark passes 60 and the first window closes.
export const sysdesignM15WatermarkAdvances: SceneSpec = {
  kind: "scene",
  title: "The watermark passes 60 and the first window closes",
  purpose: "Events arrive with times 30, 55 and 70. The counter keeps a watermark 10 seconds behind the newest time it has seen. When the watermark reaches 60, the window from 0 to 60 is closed and counted.",
  limits: "The 10 second delay is a course number. A real watermark is a rule such as the newest time seen minus a bound; chapter 15.6 explains the choice.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "tablets", label: "Tablets", kind: "phone", sub: "send events", x: 60, y: 100 },
      { id: "counter", label: "Counter", kind: "server", sub: "watermark: -", x: 360, y: 100 },
    ],
    strip: { y: 270, from: 0, to: 120, unit: "s", caption: "event time in seconds", every: 30 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "tablets", to: "counter", label: "event 30" },
      { kind: "tag", at: 0.4, row: 0, value: 30, label: "e30", tone: "accent" },
      { kind: "say", at: 1.2, actor: "counter", text: "watermark 20", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 0.8, from: "tablets", to: "counter", label: "event 55" },
      { kind: "tag", at: 1.9, row: 1, value: 55, label: "e55", tone: "accent" },
      { kind: "say", at: 2.7, actor: "counter", text: "watermark 45", tone: "accent" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "tablets", to: "counter", label: "event 70" },
      { kind: "tag", at: 3.4, row: 0, value: 70, label: "e70", tone: "good" },
      { kind: "say", at: 4.2, actor: "counter", text: "watermark 60", tone: "warn" },
      { kind: "line", at: 4.2, value: 60, label: "watermark 60" },
      { kind: "say", at: 5, actor: "tablets", text: "0-60 closed: 2", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Watermark passes 60: window closes", tone: "good" },
    ],
    loop: 8.4,
  },
};
