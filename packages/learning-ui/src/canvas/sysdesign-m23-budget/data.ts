import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.3 beat 1: A 60 ms round trip uses most of a 100 ms budget before the server does any work.
export const sysdesignM23Budget: SceneSpec = {
  kind: "scene",
  title: "A far round trip spends most of the 100 ms",
  purpose: "A shopper on the west coast asks a suggestion server on the east coast. The round trip alone takes 60 ms of the 100 ms budget. Only 40 ms is left for everything else.",
  limits: "60 ms is the napkin-math round trip between North America East and West, used as an example. Your own users will be nearer or further. The lookup in memory takes microseconds, so it does not show on this scale.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "west coast", x: 70, y: 100 },
      { id: "suggest", label: "Suggest", kind: "server", sub: "east region", x: 350, y: 185 },
    ],
    strip: { y: 292, from: 0, to: 100, unit: "ms", caption: "time since the key press", every: 20 },
    events: [
      { kind: "line", at: 0.2, value: 100, label: "budget 100 ms" },
      { kind: "fly", at: 0.6, dur: 1.2, from: "phone", to: "suggest", label: "sho" },
      { kind: "say", at: 1.8, actor: "suggest", text: "3 ideas", tone: "good" },
      { kind: "fly", at: 2.0, dur: 1.2, from: "suggest", to: "phone", label: "3 ideas", tone: "good" },
      { kind: "say", at: 3.2, actor: "phone", text: "ideas shown", tone: "good" },
      { kind: "tag", at: 3.3, row: 0, value: 60, label: "trip 60 ms", tone: "warn" },
      { kind: "tag", at: 3.8, row: 1, value: 80, label: "40 ms left", tone: "accent" },
      { kind: "verdict", at: 4.2, text: "The road took 60 of 100 ms", tone: "warn" },
    ],
    loop: 7.5,
  },
};
