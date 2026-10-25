import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.1 beat 2: A cart with no leader takes both adds, then has two versions.
export const sysdesignM13CartAccepts: SceneSpec = {
  kind: "scene",
  title: "A cart with no leader takes both adds, then has two versions",
  purpose: "Node B is down, but any other node takes a write. Hana adds milk and Dina adds tea at the same time. Both are saved, and the two nodes end up with different carts.",
  limits: "Three nodes and two shoppers. How the nodes compare versions and settle the difference is the rest of the module. This picture only shows the price of always saying yes.",
  scene: {
    width: 420,
    height: 345,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "Add milk", x: 60, y: 100 },
      { id: "dina", label: "Dina", kind: "user", sub: "Add tea", x: 360, y: 100 },
      { id: "a", label: "Node A", kind: "database", sub: "cart: empty", x: 60, y: 205 },
      { id: "c", label: "Node C", kind: "database", sub: "cart: empty", x: 360, y: 205 },
      { id: "b", label: "Node B", kind: "database", sub: "cart: empty", x: 210, y: 295 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "b", text: "down", tone: "bad" },
      { kind: "mark", at: 0.2, actor: "b", tone: "bad" },
      { kind: "fly", at: 0.6, dur: 0.8, from: "hana", to: "a", label: "add milk" },
      { kind: "fly", at: 0.6, dur: 0.8, from: "dina", to: "c", label: "add tea" },
      { kind: "say", at: 1.4, actor: "a", text: "milk", tone: "good" },
      { kind: "say", at: 1.4, actor: "c", text: "tea", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "a", to: "hana", label: "OK", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "c", to: "dina", label: "OK", tone: "good" },
      { kind: "fly", at: 2.8, dur: 1.2, from: "a", to: "c", label: "milk" },
      { kind: "fly", at: 2.8, dur: 1.2, from: "c", to: "a", label: "tea" },
      { kind: "say", at: 4, actor: "a", text: "milk | tea", tone: "warn" },
      { kind: "say", at: 4, actor: "c", text: "milk | tea", tone: "warn" },
      { kind: "verdict", at: 4.3, text: "Both adds saved; now two versions", tone: "warn" },
    ],
    loop: 7.6,
  },
};
