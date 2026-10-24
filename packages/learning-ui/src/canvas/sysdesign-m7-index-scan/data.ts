import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.3 beat 1. An index lets the database find rows by touching a handful of pages instead of the whole table.
export const sysdesignM7IndexScan: SceneSpec = {
  kind: "scene",
  title: "Without an index, the database reads every page",
  purpose: "Finding the 18 tickets of buyer 91 in 2,000,000 rows reads 12,739 pages by scanning, and 21 pages through an index: 3 index pages and 18 table pages.",
  limits: "These are counts from one run on PostgreSQL 18.6 with 2,000,000 made-up rows and 100,000 buyers. Real counts depend on row width and on how the rows are spread. The picture counts pages, not time. The pages of a scan are read in order, so each is cheaper than a random one.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "Ticketline app", kind: "server", sub: "find buyer 91", x: 62, y: 100 },
      { id: "db", label: "Tickets table", kind: "database", sub: "2,000,000 rows", x: 358, y: 100 },
    ],
    strip: { y: 305, from: 0, to: 13000, unit: "pages", caption: "pages read for one lookup", every: 2500 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "db", label: "buyer 91?" },
      { kind: "say", at: 1.2, actor: "db", text: "scans all pages", tone: "warn" },
      { kind: "tag", at: 1.6, row: 0, value: 12739, label: "scan: 12,739", tone: "bad" },
      { kind: "fly", at: 2.6, dur: 0.8, from: "app", to: "db", label: "same, with index" },
      { kind: "say", at: 3.5, actor: "db", text: "reads 21 pages", tone: "good" },
      { kind: "tag", at: 3.6, row: 1, value: 21, label: "index: 21", tone: "good" },
      { kind: "verdict", at: 4.2, text: "12,739 pages against 21", tone: "good" },
    ],
    loop: 7,
  },
};
