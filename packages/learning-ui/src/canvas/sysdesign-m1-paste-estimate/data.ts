import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 3 of 1.4: estimate. 100,000 new pastes a day (an assumption) /
// 86,400 seconds = about 1.2 writes a second. 10 reads per paste = about
// 12 reads a second. 10 KB average x 100,000 x 30 days = 30 GB.
export const sysdesignM1PasteEstimate: SceneSpec = {
  kind: "scene",
  title: "Estimate: three small sums from one daily number",
  purpose: "From 100,000 pastes a day, three sums give about 1.2 writes a second, 12 reads a second and 30 GB of storage.",
  limits: "All inputs are assumptions for a fictional pastebin: 100,000 pastes a day, 10 reads per paste, 10 KB per paste, kept 30 days. These are averages; the busiest hour can be several times higher, which module 2 shows how to estimate.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "day", label: "Per day", kind: "clock", sub: "100k pastes", x: 70, y: 175 },
      { id: "writes", label: "Writes", kind: "server", sub: "? per second", x: 330, y: 100 },
      { id: "reads", label: "Reads", kind: "server", sub: "? per second", x: 330, y: 175 },
      { id: "storage", label: "Storage", kind: "database", sub: "? GB", x: 330, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.9, from: "day", to: "writes", label: "/ 86,400 s" },
      { kind: "say", at: 0.9, actor: "writes", text: "1.2 per second", tone: "accent" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "day", to: "reads", label: "x 10 reads" },
      { kind: "say", at: 2.5, actor: "reads", text: "12 per second", tone: "accent" },
      { kind: "fly", at: 3.2, dur: 0.9, from: "day", to: "storage", label: "x 10 KB x 30 days" },
      { kind: "say", at: 4.1, actor: "storage", text: "30 GB in total", tone: "accent" },
      { kind: "verdict", at: 4.4, text: "Small numbers: keep it simple", tone: "good" },
    ],
    loop: 7.4,
  },
};
