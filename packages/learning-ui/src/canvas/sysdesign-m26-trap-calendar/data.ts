import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.4 beat 6 (A calendar that never ends).
export const sysdesignM26TrapCalendar: SceneSpec = {
  kind: "scene",
  title: "A per-site budget ends a crawler trap",
  purpose: "A calendar page links to \"next month\", and next month links to the month after, forever. Every address is new, so the seen check never stops it. A limit on pages per site does.",
  limits: "A budget of 50 pages is a course number for a site this size. A big, honest site needs a bigger budget, so real crawlers scale the budget with the site's quality and look for repeating patterns too.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "fetcher", label: "Fetcher", kind: "worker", sub: "page 0", x: 70, y: 100 },
      { id: "cal", label: "cal.example", kind: "server", sub: "never ends", x: 350, y: 100 },
      { id: "budget", label: "Budget", kind: "note", sub: "50 pages max", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "fetcher", to: "cal", label: "GET 2026-1" },
      { kind: "say", at: 0.9, actor: "fetcher", text: "page 1", tone: "accent" },
      { kind: "fly", at: 1, dur: 0.7, from: "cal", to: "fetcher", label: "next month" },
      { kind: "fly", at: 1.8, dur: 0.7, from: "fetcher", to: "cal", label: "GET 2026-2" },
      { kind: "say", at: 2.5, actor: "fetcher", text: "page 2", tone: "accent" },
      { kind: "say", at: 3, actor: "fetcher", text: "page 20", tone: "warn" },
      { kind: "say", at: 3.4, actor: "fetcher", text: "page 49", tone: "warn" },
      { kind: "say", at: 3.8, actor: "budget", text: "50 used", tone: "bad" },
      { kind: "mark", at: 3.8, actor: "budget", tone: "bad" },
      { kind: "say", at: 4.2, actor: "fetcher", text: "stops here", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Budget per site ends the trap", tone: "good" },
    ],
    loop: 8,
  },
};
