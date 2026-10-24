import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.2 beat 5 (Release one cell at a time). A bad release is caught in the first cell.
export const sysdesignM19CellRollout: SceneSpec = {
  kind: "scene",
  title: "A bad release stops at the first cell",
  purpose: "The same release goes to one cell first. Its errors show up, the rollout stops, and the other two cells never receive it.",
  limits: "Three cells, a made-up error check and a made-up pause. Real rollouts wait for a longer bake time and watch more signals than errors.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "deploy", label: "Deploy tool", kind: "worker", sub: "release 42", x: 210, y: 105 },
      { id: "c1", label: "Cell 1", kind: "server", sub: "running 41", x: 62, y: 215 },
      { id: "c2", label: "Cell 2", kind: "server", sub: "running 41", x: 210, y: 215 },
      { id: "c3", label: "Cell 3", kind: "server", sub: "running 41", x: 358, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "deploy", to: "c1", label: "release 42" },
      { kind: "say", at: 1.4, actor: "c1", text: "running 42", tone: "warn" },
      { kind: "say", at: 2.4, actor: "c1", text: "errors", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "c1", tone: "bad" },
      { kind: "say", at: 2.9, actor: "deploy", text: "rollout halted", tone: "bad" },
      { kind: "say", at: 3.6, actor: "c2", text: "still on 41", tone: "good" },
      { kind: "say", at: 3.6, actor: "c3", text: "still on 41", tone: "good" },
      { kind: "verdict", at: 3.9, text: "Bad release hit 1 of 3 cells", tone: "good" },
    ],
    loop: 6.8,
  },
};
