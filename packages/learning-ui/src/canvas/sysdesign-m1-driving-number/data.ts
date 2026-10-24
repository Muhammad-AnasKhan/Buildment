import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 4 of 1.2: in exam week Daftar (fictional) gets about 2 uploads and
// 200 reads a second. Reads arrive far more often than uploads; that ratio
// is the number that drives the design. Both rates are illustrative.
export const sysdesignM1DrivingNumber: SceneSpec = {
  kind: "scene",
  title: "Reads outnumber uploads 100 to 1",
  purpose: "Many read requests and one upload reach Daftar; the strip shows 2 uploads and 200 reads a second at the exam peak.",
  limits: "Illustrative peak rates for a fictional app. The dots are a sample, not one dot per request. The real ratio for any app comes from its own logs or from an estimate like the ones in module 2.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "students", label: "Students", kind: "user", sub: "exam week", x: 70, y: 105 },
      { id: "app", label: "Daftar", kind: "server", sub: "serving", x: 300, y: 105 },
    ],
    strip: { y: 252, from: 0, to: 250, unit: "", caption: "requests per second at the exam peak", every: 50 },
    events: [
      { kind: "fly", at: 0, dur: 0.6, from: "students", to: "app", label: "read" },
      { kind: "fly", at: 0.7, dur: 0.6, from: "students", to: "app", label: "read" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "students", to: "app", label: "upload", tone: "warn" },
      { kind: "tag", at: 1.8, row: 0, value: 2, label: "uploads 2/s", tone: "warn" },
      { kind: "fly", at: 2.1, dur: 0.6, from: "students", to: "app", label: "read" },
      { kind: "fly", at: 2.8, dur: 0.6, from: "students", to: "app", label: "read" },
      { kind: "tag", at: 3.0, row: 1, value: 200, label: "reads 200/s" },
      { kind: "fly", at: 3.5, dur: 0.6, from: "students", to: "app", label: "read" },
      { kind: "say", at: 4.2, actor: "app", text: "read-heavy", tone: "accent" },
      { kind: "mark", at: 4.2, actor: "app", tone: "accent" },
      { kind: "verdict", at: 4.4, text: "Reads drive this design, 100 to 1", tone: "accent" },
    ],
    loop: 7.6,
  },
};
