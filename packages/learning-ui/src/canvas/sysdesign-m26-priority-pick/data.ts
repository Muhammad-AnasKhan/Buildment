import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.3 beat 4 (Important URLs go first).
export const sysdesignM26PriorityPick: SceneSpec = {
  kind: "scene",
  title: "The fetcher picks by priority, not by arrival",
  purpose: "Each URL in the frontier has a priority. The fetcher takes the most important one first, even if it arrived last.",
  limits: "Three URLs on three different hosts, all ready now. A URL whose host is still waiting is skipped for a ready one, whatever its priority. Priority can also starve low URLs, so real frontiers raise a URL's priority as it ages.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "wiki", label: "wiki.example", kind: "note", sub: "low, came 1st", x: 70, y: 100 },
      { id: "shop", label: "shop.example", kind: "note", sub: "normal, 2nd in", x: 210, y: 100 },
      { id: "news", label: "news.example", kind: "note", sub: "high, came 3rd", x: 350, y: 100 },
      { id: "fetcher", label: "Fetcher", kind: "worker", sub: "ready", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "news", to: "fetcher", label: "high first" },
      { kind: "say", at: 1.2, actor: "news", text: "fetched 1st", tone: "good" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "shop", to: "fetcher", label: "then normal" },
      { kind: "say", at: 2.7, actor: "shop", text: "fetched 2nd", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.8, from: "wiki", to: "fetcher", label: "low last" },
      { kind: "say", at: 4.2, actor: "wiki", text: "fetched 3rd", tone: "warn" },
      { kind: "verdict", at: 4.4, text: "Priority beats arrival order", tone: "good" },
    ],
    loop: 8,
  },
};
