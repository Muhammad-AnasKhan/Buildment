import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.7 beat 3: an origin shield, a middle cache layer between the edges and
// the origin. Without it, each of 20 edges fetches a page once per TTL, so
// the origin sees 20 fetches. With it, edges ask the shield, and only the
// shield's one miss reaches the origin.
export const sysdesignM5OriginShield: SceneSpec = {
  kind: "scene",
  title: "A shield turns 20 edge misses into 1 fetch",
  purpose: "Two of 20 edges miss the same page; both ask the shield, which fetches it from the origin once and answers the second edge itself.",
  limits: "20 edges is a made-up number and only two are drawn. The shield adds one more hop on a miss, and if the shield is far from an edge that hop can cost more than it saves for rarely read pages.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "e1", label: "Edge 1", kind: "cdn", sub: "miss", x: 60, y: 100 },
      { id: "e2", label: "Edge 20", kind: "cdn", sub: "miss", x: 60, y: 220 },
      { id: "shield", label: "Shield", kind: "cache", sub: "empty", x: 210, y: 160 },
      { id: "origin", label: "Origin", kind: "server", sub: "EU West", x: 360, y: 160 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "e1", to: "shield", label: "GET /p/42" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "shield", to: "origin", label: "fetch, once" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "origin", to: "shield", label: "page" },
      { kind: "say", at: 2.3, actor: "shield", text: "has p42", tone: "good" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "shield", to: "e1", label: "page", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.6, from: "e2", to: "shield", label: "GET /p/42" },
      { kind: "say", at: 3.4, actor: "shield", text: "hit", tone: "good" },
      { kind: "fly", at: 3.5, dur: 0.6, from: "shield", to: "e2", label: "page", tone: "good" },
      { kind: "say", at: 4.1, actor: "origin", text: "1 fetch, not 20", tone: "good" },
      { kind: "say", at: 4.1, actor: "e1", text: "has p42", tone: "good" },
      { kind: "say", at: 4.1, actor: "e2", text: "has p42", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Shield: 1 origin fetch, not 20", tone: "good" },
    ],
    loop: 8,
  },
};
