import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.2 beat 4 (Why not build the feed in one query?)
export const sysdesignM21OneQueryFeed: SceneSpec = {
  kind: "scene",
  title: "One feed open asks the database 150 times",
  purpose: "If the feed is built when the reader opens it, by reading the latest posts of each followed account, one feed open becomes about 150 lookups. At 17,000 feed opens a second that is about 2.6 million lookups a second.",
  limits: "Course numbers: 150 follows on average, 17,000 feed opens a second at peak. A real database can batch some lookups, which lowers the cost but not the shape of the problem.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "opens feed", x: 70, y: 100 },
      { id: "feed", label: "Feed", kind: "server", sub: "17,000/s", x: 350, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "posts table", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "feed", label: "open feed" },
      { kind: "fly", at: 1.1, dur: 0.9, from: "feed", to: "db", label: "150 lookups", tone: "warn" },
      { kind: "say", at: 2, actor: "db", text: "150 reads", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "db", to: "feed", label: "150 lists" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "feed", to: "phone", label: "feed" },
      { kind: "say", at: 4, actor: "db", text: "2.6M/s at peak", tone: "bad" },
      { kind: "mark", at: 4, actor: "db", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "150 lookups for one feed open", tone: "bad" },
    ],
    loop: 7.5,
  },
};
