import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.1 beat 1 (Every page leads to more pages).
export const sysdesignM26FollowLinks: SceneSpec = {
  kind: "scene",
  title: "A crawler follows the links it finds",
  purpose: "A crawler keeps a list of web addresses to visit. It takes one, fetches the page, saves it, and adds the new links it found to the list. That loop is the whole job.",
  limits: "One page and one website. A real crawler has many fetchers and many sites, and most links it finds point to pages it already knows. The chapters after this one add those parts.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "frontier", label: "Frontier", kind: "queue", sub: "1 URL waiting", x: 70, y: 100 },
      { id: "fetcher", label: "Fetcher", kind: "worker", sub: "idle", x: 350, y: 100 },
      { id: "site", label: "Website", kind: "server", sub: "shop.example", x: 350, y: 235 },
      { id: "store", label: "Store", kind: "database", sub: "empty", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "frontier", to: "fetcher", label: "next URL" },
      { kind: "say", at: 1, actor: "fetcher", text: "fetching", tone: "accent" },
      { kind: "fly", at: 1, dur: 0.8, from: "fetcher", to: "site", label: "GET page" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "site", to: "fetcher", label: "HTML page" },
      { kind: "say", at: 2.7, actor: "fetcher", text: "found 3 links", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.9, from: "fetcher", to: "store", label: "save page" },
      { kind: "fly", at: 2.8, dur: 0.9, from: "fetcher", to: "frontier", label: "3 new URLs" },
      { kind: "say", at: 3.7, actor: "store", text: "1 page", tone: "good" },
      { kind: "say", at: 3.7, actor: "frontier", text: "3 URLs waiting", tone: "accent" },
      { kind: "verdict", at: 4, text: "Each page leads to more pages", tone: "good" },
    ],
    loop: 7.5,
  },
};
