import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.6 beat 1: Without the context, a merged cart becomes a third version.
export const sysdesignM13SiblingContext: SceneSpec = {
  kind: "scene",
  title: "Without the context, a merged cart becomes a third version",
  purpose: "The app reads two versions, merges them, and saves. If it forgets the context the store gave it, the new cart is concurrent with both old ones, so the store keeps three. Sending the context back replaces them all.",
  limits: "One cart, one app. A real context is the list of vector clocks the read returned, passed back unchanged and never edited by the app (S45).",
  scene: {
    width: 420,
    height: 245,
    actors: [
      { id: "app", label: "App", kind: "phone", sub: "merged cart", x: 60, y: 120 },
      { id: "store", label: "Store", kind: "database", sub: "2 versions", x: 360, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "store", to: "app", label: "2 versions" },
      { kind: "say", at: 1.3, actor: "app", text: "merges: union", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 1, from: "app", to: "store", label: "no context" },
      { kind: "say", at: 2.8, actor: "store", text: "3 versions", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "store", tone: "bad" },
      { kind: "fly", at: 3.4, dur: 1, from: "store", to: "app", label: "3 versions" },
      { kind: "say", at: 4.4, actor: "app", text: "merges again", tone: "accent" },
      { kind: "fly", at: 4.8, dur: 1, from: "app", to: "store", label: "cart + context", tone: "good" },
      { kind: "say", at: 5.8, actor: "store", text: "1 version", tone: "good" },
      { kind: "verdict", at: 6, text: "Context lets a write replace siblings", tone: "good" },
    ],
    loop: 9,
  },
};
