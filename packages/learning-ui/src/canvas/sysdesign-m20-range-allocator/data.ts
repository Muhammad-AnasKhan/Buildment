import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.3 beat 4: Each app claims a block of a million numbers and then works alone.
export const sysdesignM20RangeAllocator: SceneSpec = {
  kind: "scene",
  title: "Each app claims a block of numbers, then works alone",
  purpose: "App 1 claims the first million numbers and App 2 the next million. Each then makes codes without asking again, so the store sees one trip per million codes.",
  limits: "The block size of 1 million is a course number. A crash wastes the rest of that app's block; with 3.5 trillion possible 7-character codes, that is cheap.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "app1", label: "App 1", kind: "server", sub: "needs a block", x: 70, y: 100 },
      { id: "app2", label: "App 2", kind: "server", sub: "needs a block", x: 70, y: 235 },
      { id: "store", label: "Range table", kind: "database", sub: "next: 0", x: 350, y: 168 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "app1", to: "store", label: "claim 1M" },
      { kind: "say", at: 1.1, actor: "store", text: "next: 1M", tone: "accent" },
      { kind: "fly", at: 1.2, dur: 0.9, from: "store", to: "app1", label: "0 to 999,999" },
      { kind: "say", at: 2.1, actor: "app1", text: "uses 0, 1, 2...", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.9, from: "app2", to: "store", label: "claim 1M" },
      { kind: "say", at: 3.4, actor: "store", text: "next: 2M", tone: "accent" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "store", to: "app2", label: "1M to 2M" },
      { kind: "say", at: 4.4, actor: "app2", text: "uses 1M, 1M+1", tone: "good" },
      { kind: "verdict", at: 4.6, text: "No clash, one trip per 1M codes", tone: "good" },
    ],
    loop: 8,
  },
};
