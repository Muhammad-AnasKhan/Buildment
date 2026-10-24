import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.1 beat 1: nobody multiplied, so the disk fills. 2,000 students x 10 photos
// x 2 MB = 40 GB a day; 500 GB / 40 GB a day = 12.5 days.
export const sysdesignM2DiskFills: SceneSpec = {
  kind: "scene",
  title: "Notes photos fill the disk in under two weeks",
  purpose: "2,000 students each upload 10 photos of 2 MB a day, so 40 GB a day lands on a 500 GB disk.",
  limits: "A course story with assumed numbers. Real uploads change from day to day, and the same disk also holds the system, logs and the database, so it would fill even sooner. A day passes in about half a second.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "students", kind: "user", label: "Students", sub: "2,000 phones", x: 60, y: 100 },
      { id: "app", kind: "server", label: "App server", sub: "one server", x: 210, y: 100 },
      { id: "disk", kind: "database", label: "Disk", sub: "500 GB free", x: 360, y: 100 },
    ],
    strip: { y: 270, from: 0, to: 14, unit: "", caption: "days after launch", every: 2 },
    events: [
      { kind: "tag", at: 0.2, row: 1, value: 0, label: "launch" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "students", to: "app", label: "photos" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "app", to: "disk", label: "40 GB a day" },
      { kind: "say", at: 1.9, actor: "disk", text: "day 1: 40 GB" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "students", to: "app", label: "photos" },
      { kind: "fly", at: 2.6, dur: 0.6, from: "app", to: "disk", label: "40 GB a day" },
      { kind: "say", at: 3.2, actor: "disk", text: "day 6: 240 GB", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 0.6, from: "students", to: "app", label: "photos" },
      { kind: "fly", at: 3.9, dur: 0.6, from: "app", to: "disk", label: "40 GB a day" },
      { kind: "say", at: 4.5, actor: "disk", text: "day 12: 480 GB", tone: "warn" },
      { kind: "fly", at: 4.6, dur: 0.6, from: "students", to: "app", label: "photos" },
      { kind: "say", at: 5.3, actor: "disk", text: "full", tone: "bad" },
      { kind: "mark", at: 5.3, actor: "disk", tone: "bad" },
      { kind: "tag", at: 5.3, row: 0, value: 12.5, label: "disk full", tone: "bad" },
      { kind: "say", at: 5.6, actor: "app", text: "uploads fail", tone: "bad" },
      { kind: "say", at: 5.6, actor: "students", text: "notes lost", tone: "bad" },
      { kind: "verdict", at: 5.6, text: "Disk full on day 13", tone: "bad" },
    ],
    loop: 9,
  },
};
