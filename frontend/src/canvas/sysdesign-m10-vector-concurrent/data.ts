import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.4 beat 4: two edits with no message between them have vectors where
// neither is smaller than the other. They are concurrent, so keep both.
export const sysdesignM10VectorConcurrent: SceneSpec = {
  kind: "scene",
  title: "Neither vector is bigger: keep both versions",
  purpose: "Node A adds milk to a cart and node C adds tea at the same time. Their vectors are [1,0,0] and [0,0,1]. Node B receives both and cannot say which is newer.",
  limits: "A made-up cart with two items. Dynamo's shopping cart works like this (S45), but a real store would also keep a context with each version. Keeping both is one choice; the next beat merges them.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "[1,0,0]", x: 70, y: 100 },
      { id: "c", label: "Node C", kind: "server", sub: "[0,0,1]", x: 350, y: 100 },
      { id: "b", label: "Node B", kind: "database", sub: "empty cart", x: 210, y: 195 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "a", text: "added milk", tone: "accent" },
      { kind: "say", at: 0.3, actor: "c", text: "added tea", tone: "accent" },
      { kind: "fly", at: 0.9, dur: 1.1, from: "a", to: "b", label: "milk [1,0,0]" },
      { kind: "say", at: 2, actor: "b", text: "has [1,0,0]" },
      { kind: "fly", at: 2.3, dur: 1.1, from: "c", to: "b", label: "tea [0,0,1]" },
      { kind: "say", at: 3.4, actor: "b", text: "2 versions", tone: "warn" },
      { kind: "mark", at: 3.4, actor: "b", tone: "warn" },
      { kind: "verdict", at: 3.8, text: "Concurrent: keep both versions", tone: "warn" },
    ],
    loop: 7.2,
  },
};
