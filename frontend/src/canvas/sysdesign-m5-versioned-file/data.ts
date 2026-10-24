import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.7 beat 5: purge or rename. A new stylesheet ships under a new name,
// app.v2.css. Pages now link to the new name, so every edge misses once and
// fetches it; the old app.v1.css is never asked for again. No purge, and no
// edge can serve the old file for the new name.
export const sysdesignM5VersionedFile: SceneSpec = {
  kind: "scene",
  title: "A new file name needs no purge",
  purpose: "The new stylesheet ships as app.v2.css; the edge has never seen that name, so it fetches the new file, and the old one is simply not asked for.",
  limits: "The page that links to the file (the HTML) still needs a short lifetime or a purge, or it keeps pointing at the old name. Purging a path is the other choice; on CloudFront, the first 1,000 invalidation paths a month are free.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "dev", label: "Developer", kind: "user", sub: "ships v2", x: 60, y: 100 },
      { id: "edge", label: "CDN edge", kind: "cdn", sub: "app.v1.css", x: 210, y: 100 },
      { id: "origin", label: "Origin", kind: "server", sub: "app.v1.css", x: 360, y: 100 },
      { id: "phone", label: "Shopper", kind: "phone", sub: "page links v2", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "dev", to: "origin", label: "upload app.v2.css" },
      { kind: "say", at: 1.1, actor: "origin", text: "v1 and v2", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.6, from: "phone", to: "edge", label: "GET app.v2.css" },
      { kind: "say", at: 2.2, actor: "edge", text: "miss: new name", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.6, from: "edge", to: "origin", label: "fetch v2" },
      { kind: "fly", at: 3.0, dur: 0.6, from: "origin", to: "edge", label: "v2" },
      { kind: "say", at: 3.6, actor: "edge", text: "v1 and v2", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.6, from: "edge", to: "phone", label: "v2", tone: "good" },
      { kind: "say", at: 4.2, actor: "phone", text: "new style", tone: "good" },
      { kind: "say", at: 4.2, actor: "dev", text: "no purge sent", tone: "good" },
      { kind: "verdict", at: 4.6, text: "New name: no purge, no stale file", tone: "good" },
    ],
    loop: 8,
  },
};
