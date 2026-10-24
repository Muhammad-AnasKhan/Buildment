import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.2 beat 2 (One page, start to finish).
export const sysdesignM26OnePage: SceneSpec = {
  kind: "scene",
  title: "One page goes through every block",
  purpose: "The frontier gives a URL to a fetcher. The fetcher passes the page to a parser. The parser sends the text to storage and the links to a URL check, and only unseen links go back to the frontier.",
  limits: "One page, one pass. A real crawler runs hundreds of these at the same moment and also checks robots.txt and the page's content fingerprint, which later beats add.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "frontier", label: "Frontier", kind: "queue", sub: "next URL", x: 70, y: 100 },
      { id: "fetcher", label: "Fetcher", kind: "worker", sub: "idle", x: 210, y: 100 },
      { id: "parser", label: "Parser", kind: "worker", sub: "idle", x: 350, y: 100 },
      { id: "check", label: "URL check", kind: "cache", sub: "seen set", x: 210, y: 235 },
      { id: "store", label: "Storage", kind: "database", sub: "empty", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "frontier", to: "fetcher", label: "next URL" },
      { kind: "say", at: 0.9, actor: "fetcher", text: "fetching", tone: "accent" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "fetcher", to: "parser", label: "HTML page" },
      { kind: "say", at: 2.2, actor: "parser", text: "found 3 links", tone: "accent" },
      { kind: "fly", at: 2.3, dur: 0.9, from: "parser", to: "store", label: "page text" },
      { kind: "fly", at: 2.3, dur: 0.9, from: "parser", to: "check", label: "3 links" },
      { kind: "say", at: 3.2, actor: "check", text: "2 seen, 1 new", tone: "good" },
      { kind: "say", at: 3.2, actor: "store", text: "saved", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.9, from: "check", to: "frontier", label: "1 new URL", tone: "good" },
      { kind: "say", at: 4.3, actor: "frontier", text: "1 URL waiting", tone: "accent" },
      { kind: "verdict", at: 4.6, text: "Seen links stop here; new ones loop", tone: "good" },
    ],
    loop: 8,
  },
};
