import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.2 beat 4: Start with the rarest word, then check the others for the few products it names.
export const sysdesignM23Intersect: SceneSpec = {
  kind: "scene",
  title: "Start with the rarest word and check the rest",
  purpose: "For red waterproof shoes, the index reads the shortest list first. Waterproof names one product, so only that product is checked against the lists for red and shoe.",
  limits: "Three products only. Real engines walk several sorted lists together and skip ahead, rather than asking one question per product, but the idea is the same: the shortest list sets the work.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "search", label: "Search", kind: "server", sub: "3 query words", x: 70, y: 100 },
      { id: "index", label: "Index", kind: "database", sub: "list per word", x: 350, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "search", to: "index", label: "waterproof" },
      { kind: "say", at: 1.2, actor: "index", text: "list: 3", tone: "good" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "index", to: "search", label: "doc 3" },
      { kind: "say", at: 2.3, actor: "search", text: "keeps doc 3", tone: "accent" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "search", to: "index", label: "3 has red?" },
      { kind: "fly", at: 3.6, dur: 0.9, from: "index", to: "search", label: "yes", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.9, from: "search", to: "index", label: "3 has shoe?" },
      { kind: "fly", at: 5.8, dur: 0.9, from: "index", to: "search", label: "yes", tone: "good" },
      { kind: "say", at: 6.7, actor: "search", text: "doc 3 matches", tone: "good" },
      { kind: "verdict", at: 6.8, text: "Rarest word first: 1 product to check", tone: "good" },
    ],
    loop: 9.5,
  },
};
