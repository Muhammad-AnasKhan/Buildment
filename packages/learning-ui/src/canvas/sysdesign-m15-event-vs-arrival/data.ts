import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.6 beat 1: A sale made at 0:50 arrives at 2:10.
export const sysdesignM15EventVsArrival: SceneSpec = {
  kind: "scene",
  title: "A sale made at 0:50 arrives at 2:10",
  purpose: "A stall tablet records a sale at 0:50, loses its signal, and sends the sale at 2:10, 80 seconds late. The counter must decide which minute the sale belongs to.",
  limits: "One tablet and one sale. The 80 seconds is a course number. Event time is the time on the device that made the event.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "tablet", label: "Tablet", kind: "phone", sub: "records sales", x: 60, y: 100 },
      { id: "counter", label: "Counter", kind: "server", sub: "counts sales", x: 360, y: 100 },
    ],
    strip: { y: 265, from: 0, to: 180, unit: "s", caption: "clock time in seconds from 0:00", every: 60 },
    events: [
      { kind: "say", at: 0.3, actor: "tablet", text: "sale at 0:50", tone: "accent" },
      { kind: "tag", at: 0.4, row: 0, value: 50, label: "sold 0:50", tone: "accent" },
      { kind: "say", at: 1.4, actor: "tablet", text: "no signal", tone: "warn" },
      { kind: "say", at: 2.6, actor: "tablet", text: "back online", tone: "good" },
      { kind: "tag", at: 2.8, row: 1, value: 130, label: "arrived 2:10", tone: "warn" },
      { kind: "fly", at: 2.8, dur: 1.2, from: "tablet", to: "counter", label: "sale" },
      { kind: "say", at: 4.1, actor: "counter", text: "late by 80 s", tone: "warn" },
      { kind: "verdict", at: 4.5, text: "Sold at 0:50, arrived at 2:10", tone: "warn" },
    ],
    loop: 7.5,
  },
};
