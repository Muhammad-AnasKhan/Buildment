import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.4 beat 4: The first viewer causes one trip to storage; the second is served from the edge.
export const sysdesignM27PopularEdge: SceneSpec = {
  kind: "scene",
  title: "A popular video costs one trip to storage",
  purpose: "The first viewer in a region asks the edge for piece 1. The edge does not have it, fetches it from storage once and keeps a copy. The second viewer gets the copy from the edge, and storage is not asked again.",
  limits: "One piece, one edge, two viewers. A real CDN has many edges, each with its own copy, and an origin shield between them and storage (chapter 5.7). A copy lasts as long as its Cache-Control lifetime and as long as the edge has disk for it.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "a", label: "Viewer A", kind: "phone", sub: "first in region", x: 70, y: 100 },
      { id: "b", label: "Viewer B", kind: "phone", sub: "a minute later", x: 70, y: 235 },
      { id: "edge", label: "CDN edge", kind: "cdn", sub: "empty", x: 350, y: 100 },
      { id: "store", label: "Storage", kind: "database", sub: "all videos", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "a", to: "edge", label: "piece 1" },
      { kind: "say", at: 1.0, actor: "edge", text: "miss", tone: "bad" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "edge", to: "store", label: "fetch piece 1" },
      { kind: "fly", at: 2.0, dur: 0.8, from: "store", to: "edge", label: "piece 1" },
      { kind: "say", at: 2.8, actor: "edge", text: "keeps a copy", tone: "good" },
      { kind: "fly", at: 2.9, dur: 0.8, from: "edge", to: "a", label: "piece 1" },
      { kind: "say", at: 3.7, actor: "a", text: "playing", tone: "good" },
      { kind: "fly", at: 4.2, dur: 0.8, from: "b", to: "edge", label: "piece 1" },
      { kind: "say", at: 5.0, actor: "edge", text: "hit", tone: "good" },
      { kind: "fly", at: 5.1, dur: 0.8, from: "edge", to: "b", label: "piece 1" },
      { kind: "say", at: 5.9, actor: "b", text: "playing", tone: "good" },
      { kind: "say", at: 5.9, actor: "store", text: "read once", tone: "good" },
      { kind: "verdict", at: 6.0, text: "One trip to storage, many views", tone: "good" },
    ],
    loop: 9,
  },
};
