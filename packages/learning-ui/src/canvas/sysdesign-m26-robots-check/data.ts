import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.3 beat 5 (Ask robots.txt, then obey it).
export const sysdesignM26RobotsCheck: SceneSpec = {
  kind: "scene",
  title: "Read robots.txt once, then follow its rules",
  purpose: "Before it fetches pages from a host, the crawler fetches that host's robots.txt, keeps the rules for up to a day, and checks every URL against them.",
  limits: "One rule shown. Real files have groups for each crawler name, wildcards and an optional Crawl-delay line that only some crawlers honour. A missing file means everything is allowed, and a server error means nothing is.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "fetcher", label: "Fetcher", kind: "worker", sub: "new host", x: 70, y: 100 },
      { id: "rules", label: "Rules cache", kind: "cache", sub: "empty", x: 350, y: 100 },
      { id: "site", label: "Website", kind: "server", sub: "shop.example", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "fetcher", to: "site", label: "robots.txt?" },
      { kind: "fly", at: 1.2, dur: 0.9, from: "site", to: "rules", label: "the rules" },
      { kind: "say", at: 2.1, actor: "rules", text: "kept 24 h", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.8, from: "fetcher", to: "rules", label: "/private?" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "rules", to: "fetcher", label: "blocked", tone: "bad" },
      { kind: "say", at: 4.1, actor: "fetcher", text: "skips it", tone: "warn" },
      { kind: "fly", at: 4.5, dur: 0.8, from: "fetcher", to: "rules", label: "/shop/b?" },
      { kind: "fly", at: 5.3, dur: 0.8, from: "rules", to: "fetcher", label: "allowed", tone: "good" },
      { kind: "say", at: 6.1, actor: "fetcher", text: "fetches /shop/b", tone: "good" },
      { kind: "verdict", at: 6.3, text: "Ask once a day; obey the answer", tone: "good" },
    ],
    loop: 9,
  },
};
