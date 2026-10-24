import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.7 beat 1: the origin's Cache-Control header tells the CDN edge how long
// its copy stays fresh. max-age=60 means fresh for 60 seconds; the next
// shopper inside that time is answered by the edge, and the edge reports
// the copy's age.
export const sysdesignM5CacheControl: SceneSpec = {
  kind: "scene",
  title: "The origin's header sets the edge's clock",
  purpose: "The origin answers with Cache-Control: max-age=60; the edge keeps the page for 60 seconds and answers the next shopper itself.",
  limits: "One edge and one page. Real CDNs can be told to ignore or override headers, and an edge may evict a copy early when it needs space. s-maxage sets a separate lifetime for shared caches such as a CDN.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Shopper", kind: "phone", sub: "opens p42", x: 60, y: 100 },
      { id: "edge", label: "CDN edge", kind: "cdn", sub: "empty", x: 210, y: 100 },
      { id: "origin", label: "Origin", kind: "server", sub: "sets header", x: 360, y: 100 },
    ],
    strip: { y: 268, from: 0, to: 80, unit: "s", caption: "seconds after the first request", every: 20 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "phone", to: "edge", label: "GET /p/42" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "edge", to: "origin", label: "GET /p/42" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "origin", to: "edge", label: "max-age=60" },
      { kind: "say", at: 2.0, actor: "edge", text: "fresh for 60 s", tone: "good" },
      { kind: "tag", at: 2.0, row: 0, value: 0, label: "stored at 0 s" },
      { kind: "fly", at: 2.0, dur: 0.5, from: "edge", to: "phone", label: "page" },
      { kind: "say", at: 2.8, actor: "phone", text: "next shopper" },
      { kind: "fly", at: 3.0, dur: 0.5, from: "phone", to: "edge", label: "GET /p/42" },
      { kind: "say", at: 3.5, actor: "edge", text: "hit, age 12 s", tone: "good" },
      { kind: "tag", at: 3.5, row: 1, value: 12, label: "hit at 12 s", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.5, from: "edge", to: "phone", label: "page", tone: "good" },
      { kind: "tag", at: 4.2, row: 0, value: 60, label: "stale at 60 s", tone: "warn" },
      { kind: "say", at: 4.2, actor: "origin", text: "not asked", tone: "good" },
      { kind: "verdict", at: 4.6, text: "The header decides: fresh 60 s", tone: "good" },
    ],
    loop: 8,
  },
};
