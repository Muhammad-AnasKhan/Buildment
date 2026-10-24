import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.6 beat 2: Merging two carts by union brings a removed item back.
export const sysdesignM13CartResurrect: SceneSpec = {
  kind: "scene",
  title: "Merging two carts by union brings a removed item back",
  purpose: "Hana removes milk on node A. At the same time Dina adds tea on node B. When the nodes merge by union, the milk that Hana removed is still in Dina's cart, so it returns.",
  limits: "Two carts and a union merge. This is the Dynamo shopping cart behaviour: an added item is never lost, but a deleted item can come back (S45).",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "hana", label: "Hana", kind: "phone", sub: "removes milk", x: 60, y: 100 },
      { id: "dina", label: "Dina", kind: "user", sub: "adds tea", x: 360, y: 100 },
      { id: "a", label: "Node A", kind: "database", sub: "eggs, milk", x: 60, y: 205 },
      { id: "b", label: "Node B", kind: "database", sub: "eggs, milk", x: 360, y: 205 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "hana", to: "a", label: "remove milk" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "dina", to: "b", label: "add tea" },
      { kind: "say", at: 1.3, actor: "a", text: "eggs", tone: "accent" },
      { kind: "say", at: 1.3, actor: "b", text: "eggs,milk,tea", tone: "accent" },
      { kind: "fly", at: 2.3, dur: 1.4, from: "a", to: "b", label: "eggs" },
      { kind: "fly", at: 2.3, dur: 1.4, from: "b", to: "a", label: "eggs,milk,tea" },
      { kind: "say", at: 3.9, actor: "a", text: "eggs,milk,tea", tone: "warn" },
      { kind: "say", at: 3.9, actor: "b", text: "eggs,milk,tea", tone: "warn" },
      { kind: "mark", at: 3.9, actor: "a", tone: "bad" },
      { kind: "say", at: 4.2, actor: "hana", text: "milk is back", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "The removed milk came back", tone: "bad" },
    ],
    loop: 7.5,
  },
};
