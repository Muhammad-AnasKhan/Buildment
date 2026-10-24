import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.7 beat 2: Cache-Control: no-cache does not forbid storing. The edge keeps
// the copy but must ask the origin before each use. It sends the copy's ETag
// in If-None-Match; the origin answers 304 Not Modified with no body, and the
// edge serves its stored copy. no-store is the directive that forbids storing.
export const sysdesignM5Revalidate: SceneSpec = {
  kind: "scene",
  title: "no-cache means ask first, not do not store",
  purpose: "With no-cache the edge keeps the page but checks with the origin each time; the origin answers 304 Not Modified, so no page body travels.",
  limits: "The check still costs a round trip to the origin, so it saves bandwidth and origin work, not the trip itself. The origin must compute or look up the ETag cheaply for this to help.",
  scene: {
    width: 420,
    height: 210,
    actors: [
      { id: "phone", label: "Shopper", kind: "phone", sub: "opens p42", x: 60, y: 110 },
      { id: "edge", label: "CDN edge", kind: "cdn", sub: "stored, etag a1", x: 210, y: 110 },
      { id: "origin", label: "Origin", kind: "server", sub: "no-cache", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "phone", to: "edge", label: "GET /p/42" },
      { kind: "say", at: 0.8, actor: "edge", text: "must ask first", tone: "warn" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "edge", to: "origin", label: "If-None-Match: a1" },
      { kind: "say", at: 1.9, actor: "origin", text: "unchanged", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.7, from: "origin", to: "edge", label: "304, no body", tone: "good" },
      { kind: "say", at: 2.9, actor: "edge", text: "use stored copy", tone: "good" },
      { kind: "fly", at: 3.1, dur: 0.5, from: "edge", to: "phone", label: "page", tone: "good" },
      { kind: "say", at: 3.6, actor: "phone", text: "same page", tone: "good" },
      { kind: "verdict", at: 4.0, text: "Stored, checked, sent: no-cache", tone: "good" },
    ],
    loop: 7.5,
  },
};
