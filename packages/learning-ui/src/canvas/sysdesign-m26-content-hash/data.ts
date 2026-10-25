import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.4 beat 4 (Same body, stored once).
export const sysdesignM26ContentHash: SceneSpec = {
  kind: "scene",
  title: "Hash the body to spot a copy at another address",
  purpose: "The crawler hashes each page body into a short fingerprint. If the fingerprint is already known, the page is a copy served at another URL, and the crawler stores nothing new.",
  limits: "An exact hash only catches identical bodies. One changed character gives a different fingerprint, which is why the next beat adds a fingerprint that tolerates small edits.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "fetcher", label: "Fetcher", kind: "worker", sub: "got a page", x: 70, y: 100 },
      { id: "prints", label: "Fingerprints", kind: "cache", sub: "empty", x: 350, y: 100 },
      { id: "store", label: "Storage", kind: "database", sub: "empty", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "fetcher", to: "prints", label: "shop/a: 9f3a" },
      { kind: "say", at: 1, actor: "prints", text: "new", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "fetcher", to: "store", label: "save page" },
      { kind: "say", at: 2, actor: "store", text: "1 page", tone: "good" },
      { kind: "say", at: 2, actor: "prints", text: "1 print", tone: "accent" },
      { kind: "say", at: 2.6, actor: "fetcher", text: "got a mirror", tone: "accent" },
      { kind: "fly", at: 3, dur: 0.8, from: "fetcher", to: "prints", label: "mirror/a: 9f3a" },
      { kind: "say", at: 3.8, actor: "prints", text: "seen before", tone: "warn" },
      { kind: "fly", at: 4, dur: 0.8, from: "prints", to: "fetcher", label: "same body", tone: "warn" },
      { kind: "say", at: 4.8, actor: "fetcher", text: "drops the copy", tone: "good" },
      { kind: "verdict", at: 5, text: "Same body, stored once", tone: "good" },
    ],
    loop: 9,
  },
};
