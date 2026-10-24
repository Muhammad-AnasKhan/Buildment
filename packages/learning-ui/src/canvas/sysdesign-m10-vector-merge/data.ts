import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.4 beat 5: a client reads both versions, merges the carts, and writes
// back with the merged vector. The new version is bigger than both.
export const sysdesignM10VectorMerge: SceneSpec = {
  kind: "scene",
  title: "A merge replaces both versions",
  purpose: "The phone reads two versions from node B, merges milk and tea, and writes back with the slot-by-slot maximum [1,0,1]. B adds 1 to its own slot, giving [1,1,1], which is bigger than both.",
  limits: "Merging a cart by union never loses an added item, but an item the user deleted can come back (S45). Other data needs other merge rules, and some systems pick the newest timestamp instead, which can lose a write.",
  scene: {
    width: 420,
    height: 230,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "reads cart", x: 60, y: 110 },
      { id: "b", label: "Node B", kind: "database", sub: "2 versions", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "phone", to: "b", label: "read cart" },
      { kind: "fly", at: 1.5, dur: 1, from: "b", to: "phone", label: "both versions" },
      { kind: "say", at: 2.5, actor: "phone", text: "milk + tea", tone: "accent" },
      { kind: "fly", at: 3, dur: 1, from: "phone", to: "b", label: "write [1,0,1]" },
      { kind: "say", at: 4, actor: "b", text: "saved [1,1,1]", tone: "good" },
      { kind: "verdict", at: 4.4, text: "New version replaces both", tone: "good" },
    ],
    loop: 7.6,
  },
};
