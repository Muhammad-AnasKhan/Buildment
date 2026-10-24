import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.4 beat 1 (Three spellings, one page).
export const sysdesignM26UrlNormalize: SceneSpec = {
  kind: "scene",
  title: "Clean each URL before asking if it was seen",
  purpose: "The same page can be written many ways: capital letters in the host, a #fragment, a session id. The crawler cleans each URL into one canonical form first, so the seen check sees one entry.",
  limits: "Three spellings and a short list of rules. Which query parameters are safe to drop depends on the site, so real crawlers learn them per host. Cleaning too hard can merge two different pages.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "page", label: "Links on page", kind: "note", sub: "3 links", x: 58, y: 100 },
      { id: "norm", label: "Normalise", kind: "worker", sub: "clean the URL", x: 362, y: 100 },
      { id: "seen", label: "Seen set", kind: "cache", sub: "empty", x: 362, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "page", to: "norm", label: "SHOP.example/a" },
      { kind: "fly", at: 1, dur: 0.8, from: "norm", to: "seen", label: "shop.example/a" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "page", to: "norm", label: "shop.example/a#top" },
      { kind: "fly", at: 2.7, dur: 0.8, from: "norm", to: "seen", label: "shop.example/a" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "page", to: "norm", label: "shop.example/a?sid=9" },
      { kind: "fly", at: 4.4, dur: 0.8, from: "norm", to: "seen", label: "shop.example/a" },
      { kind: "say", at: 5.2, actor: "seen", text: "1 entry", tone: "good" },
      { kind: "say", at: 5.2, actor: "norm", text: "3 became 1", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Three spellings, one page", tone: "good" },
    ],
    loop: 9,
  },
};
