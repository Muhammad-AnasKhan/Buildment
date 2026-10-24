import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.7 beat 6: a signed URL. The app gives a buyer a link that carries an
// expiry time and a signature made with a secret key the CDN can check. The
// edge serves the private file while the link is valid and refuses it after,
// without calling the app.
export const sysdesignM5SignedUrl: SceneSpec = {
  kind: "scene",
  title: "A signed URL is a ticket that expires",
  purpose: "The app signs a link that is valid for 5 minutes; the edge checks the signature and the time itself, serves the file, and refuses the same link later.",
  limits: "The edge needs the key to check signatures, set up ahead of time. Anyone holding a valid link can use it until it expires, so links are kept short-lived. Cached copies of the file are shared by all valid links.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "phone", label: "Buyer", kind: "phone", sub: "paid for manual", x: 60, y: 100 },
      { id: "app", label: "App", kind: "server", sub: "has the key", x: 60, y: 220 },
      { id: "edge", label: "CDN edge", kind: "cdn", sub: "checks links", x: 330, y: 160 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "phone", to: "app", label: "download?" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "app", to: "phone", label: "link, 5 min" },
      { kind: "fly", at: 1.7, dur: 0.7, from: "phone", to: "edge", label: "GET ?expires&sig" },
      { kind: "say", at: 2.4, actor: "edge", text: "sig ok, in time", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.6, from: "edge", to: "phone", label: "manual.pdf", tone: "good" },
      { kind: "say", at: 3.3, actor: "phone", text: "later: 6 min", tone: "warn" },
      { kind: "fly", at: 3.5, dur: 0.6, from: "phone", to: "edge", label: "same link" },
      { kind: "say", at: 4.1, actor: "edge", text: "expired: 403", tone: "bad" },
      { kind: "say", at: 4.1, actor: "app", text: "not asked", tone: "good" },
      { kind: "verdict", at: 4.5, text: "The edge checks it, no call home", tone: "good" },
    ],
    loop: 8,
  },
};
