import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.2 beat 5. A graph store follows links across many hops without joins. A search index finds and ranks documents by their words.
export const sysdesignM7StoreSpecial: SceneSpec = {
  kind: "scene",
  title: "Some questions need a special-purpose engine",
  purpose: "'Friends of friends who bought' follows links; 'jazz night' ranks words. A graph store and a search index each answer one of them well.",
  limits: "Both engines are usually fed from a main database, not used as the only copy of the data (see the last beat). The counts are made up.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "app", label: "Ticketline app", kind: "server", sub: "two questions", x: 210, y: 100 },
      { id: "graph", label: "Graph store", kind: "database", sub: "follows links", x: 80, y: 250 },
      { id: "search", label: "Search index", kind: "database", sub: "word index", x: 340, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "graph", label: "friends of friends" },
      { kind: "say", at: 1.2, actor: "graph", text: "3 hops, no join", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.8, from: "graph", to: "app", label: "8 people", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.8, from: "app", to: "search", label: "jazz night" },
      { kind: "say", at: 3.5, actor: "search", text: "ranks by words", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.8, from: "search", to: "app", label: "top 10 shows", tone: "good" },
      { kind: "verdict", at: 4.8, text: "The right engine for each question", tone: "good" },
    ],
    loop: 7.6,
  },
};
