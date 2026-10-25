import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.6 beat 3: stale-while-revalidate (RFC 5861). The copy is past its fresh
// time but still inside its stale-while-revalidate window, so shoppers get
// the old copy at once while one background request refreshes it.
export const sysdesignM5Swr: SceneSpec = {
  kind: "scene",
  title: "Serve the old copy while one request refreshes",
  purpose: "The copy is a little old; shoppers get it at once, and one background refresh fetches the new page, so nobody waits for the database.",
  limits: "Shoppers see a slightly old page for one refresh. That is fine for a product description and wrong for a stock count at checkout. The refresh still needs coalescing, or every request would start one.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "shoppers", label: "Shoppers", kind: "user", sub: "5,000 a second", x: 60, y: 100 },
      { id: "app", label: "App", kind: "server", sub: "serve stale", x: 210, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "fresh", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "calm", x: 210, y: 225 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "cache", text: "stale, usable", tone: "warn" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 1.2, dur: 0.4, from: "app", to: "cache", label: "get" },
      { kind: "fly", at: 1.6, dur: 0.4, from: "cache", to: "app", label: "old page" },
      { kind: "fly", at: 2.0, dur: 0.5, from: "app", to: "shoppers", label: "old page, now", tone: "good" },
      { kind: "fly", at: 2.1, dur: 0.6, from: "app", to: "db", label: "1 refresh" },
      { kind: "say", at: 2.7, actor: "db", text: "1 query", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 3.1, dur: 0.5, from: "app", to: "shoppers", label: "old page, now", tone: "good" },
      { kind: "fly", at: 3.3, dur: 0.5, from: "db", to: "app", label: "new page" },
      { kind: "fly", at: 3.8, dur: 0.5, from: "app", to: "cache", label: "set" },
      { kind: "say", at: 4.3, actor: "cache", text: "fresh again", tone: "good" },
      { kind: "say", at: 4.3, actor: "shoppers", text: "nobody waited", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Nobody waited; one refresh ran", tone: "good" },
    ],
    loop: 8,
  },
};
