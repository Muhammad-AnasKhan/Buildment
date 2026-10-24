import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.6 beat 6: a hot key lives on one cache node, so that node takes every
// read of it while the others sit idle. Hashing spreads keys, not the reads
// of one key. A short in-process copy on each app server takes the load off.
export const sysdesignM5HotNode: SceneSpec = {
  kind: "scene",
  title: "One hot key, one busy cache node",
  purpose: "Every read of the hot key goes to the one node that holds it; a copy kept for 1 second in the app's own memory takes those reads off the node.",
  limits: "Two cache nodes stand for many. The app's own copy can be up to 1 second old, and each app server keeps its own. Another fix is to keep several copies of the hot key on different nodes and pick one at random.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "shoppers", label: "Shoppers", kind: "user", sub: "want phone-x", x: 60, y: 160 },
      { id: "app", label: "App", kind: "server", sub: "cache client", x: 210, y: 160 },
      { id: "node1", label: "Cache node 1", kind: "cache", sub: "has phone-x", x: 360, y: 100 },
      { id: "node2", label: "Cache node 2", kind: "cache", sub: "other keys", x: 360, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "shoppers", to: "app", label: "phone-x" },
      { kind: "fly", at: 0.4, dur: 0.5, from: "shoppers", to: "app", label: "phone-x" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "app", to: "node1", label: "get" },
      { kind: "fly", at: 1.0, dur: 0.5, from: "app", to: "node1", label: "get" },
      { kind: "say", at: 1.6, actor: "node1", text: "overloaded", tone: "bad" },
      { kind: "mark", at: 1.6, actor: "node1", tone: "bad" },
      { kind: "say", at: 1.6, actor: "node2", text: "idle", tone: "warn" },
      { kind: "say", at: 2.4, actor: "app", text: "keep 1 s copy", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.5, from: "shoppers", to: "app", label: "phone-x" },
      { kind: "fly", at: 3.3, dur: 0.5, from: "app", to: "shoppers", label: "from memory", tone: "good" },
      { kind: "say", at: 3.8, actor: "node1", text: "1 get a second", tone: "good" },
      { kind: "mark", at: 3.8, actor: "node1", tone: "good" },
      { kind: "verdict", at: 4.1, text: "A local copy shields the hot node", tone: "good" },
    ],
    loop: 7.6,
  },
};
