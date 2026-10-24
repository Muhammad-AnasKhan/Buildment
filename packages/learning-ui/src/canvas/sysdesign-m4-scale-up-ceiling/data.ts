import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 4.2: scaling up. Demand grows from 100 to 400 to 1,000 requests a second;
// the team swaps in a bigger size each time until the price list ends at 800 a
// second.
export const sysdesignM4ScaleUpCeiling: SceneSpec = {
  kind: "scene",
  title: "Scale up until the price list runs out",
  purpose: "Each time traffic grows, the team swaps the server for a bigger size. It works twice, then the biggest size is still too small.",
  limits: "A made-up price list where each size handles twice the requests of the one below and the largest does 800 a second. Real machine families have more sizes, and a bigger machine does not always give a matching rise in requests a second (a single Node.js process, for example, runs your JavaScript on one core). Each swap also needs a restart, which the picture skips.",
  scene: {
    width: 420,
    height: 200,
    actors: [
      { id: "students", label: "Students", kind: "user", sub: "100/s", x: 62, y: 120 },
      { id: "server", label: "Server", kind: "server", sub: "small: 100/s", x: 210, y: 120 },
      { id: "sizes", label: "Sizes", kind: "note", sub: "up to 800/s", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "students", to: "server", label: "100/s" },
      { kind: "say", at: 0.9, actor: "server", text: "small: 100/s", tone: "good" },
      { kind: "say", at: 1.5, actor: "students", text: "400/s", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "students", to: "server", label: "400/s" },
      { kind: "say", at: 2.3, actor: "server", text: "too small", tone: "bad" },
      { kind: "fly", at: 2.5, dur: 0.6, from: "server", to: "sizes", label: "bigger?" },
      { kind: "fly", at: 3.1, dur: 0.6, from: "sizes", to: "server", label: "large", tone: "good" },
      { kind: "say", at: 3.7, actor: "server", text: "large: 400/s", tone: "good" },
      { kind: "say", at: 4.3, actor: "students", text: "1,000/s", tone: "bad" },
      { kind: "fly", at: 4.4, dur: 0.7, from: "students", to: "server", label: "1,000/s" },
      { kind: "say", at: 5.1, actor: "server", text: "too small", tone: "bad" },
      { kind: "fly", at: 5.3, dur: 0.6, from: "server", to: "sizes", label: "bigger?" },
      { kind: "fly", at: 5.9, dur: 0.6, from: "sizes", to: "server", label: "xlarge", tone: "warn" },
      { kind: "say", at: 6.5, actor: "server", text: "xlarge: 800/s", tone: "bad" },
      { kind: "say", at: 6.5, actor: "sizes", text: "no bigger size", tone: "bad" },
      { kind: "mark", at: 6.5, actor: "sizes", tone: "bad" },
      { kind: "verdict", at: 6.7, text: "Biggest size is still too small", tone: "bad" },
    ],
    loop: 9.7,
  },
};
