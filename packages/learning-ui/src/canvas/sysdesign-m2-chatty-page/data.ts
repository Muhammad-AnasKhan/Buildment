import type { SceneSpec } from "../renderers/scene/SceneCanvas";
import type { SceneEvent } from "../renderers/scene/types";

// 2.2 beat 6: a page makes 20 queries one after another. In the same region
// each is about 0.5 ms (10 ms in total); across the Atlantic each round trip
// is about 80 ms (1,600 ms in total).
function trip(n: number, at: number, dur: number): SceneEvent[] {
  return [
    { kind: "fly", at, dur, from: "app", to: "db", label: `query ${n}` },
    { kind: "fly", at: at + dur, dur, from: "db", to: "app", label: "rows" },
  ];
}

export const sysdesignM2ChattyPage: SceneSpec = {
  kind: "scene",
  title: "Twenty queries in a row, across the sea",
  purpose: "One page runs 20 database queries one after another, and the database is in another continent.",
  limits: "Each query costs one EU West to North America East round trip (about 80 ms, napkin-math) and the query work itself is left out. Twenty queries in the same region would take about 10 ms (0.5 ms each). Only some queries are drawn; the counter covers all 20.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "app", kind: "server", label: "App server", sub: "in EU West", x: 60, y: 200 },
      { id: "db", kind: "database", label: "Database", sub: "in NA East", x: 360, y: 85 },
    ],
    strip: { y: 320, from: 0, to: 1600, unit: "ms", caption: "time to build one page", every: 400 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 10, label: "same region 10 ms", tone: "good" },
      { kind: "wait", at: 0.3, dur: 4.0, actor: "app", label: "waiting {n} ms", doneLabel: "waited 1600 ms", total: 1600 },
      ...trip(1, 0.3, 0.4),
      { kind: "say", at: 1.1, actor: "app", text: "query 2 of 20" },
      ...trip(2, 1.1, 0.35),
      { kind: "say", at: 1.8, actor: "app", text: "query 3 of 20" },
      ...trip(3, 1.8, 0.3),
      { kind: "say", at: 2.4, actor: "app", text: "query 4 of 20" },
      ...trip(4, 2.4, 0.25),
      { kind: "say", at: 2.9, actor: "app", text: "query 12 of 20" },
      ...trip(12, 2.9, 0.25),
      { kind: "say", at: 3.4, actor: "app", text: "query 20 of 20" },
      ...trip(20, 3.4, 0.25),
      { kind: "say", at: 4.3, actor: "app", text: "page ready", tone: "bad" },
      { kind: "tag", at: 4.3, row: 1, value: 1600, label: "across sea 1,600 ms", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "20 queries across the sea: 1.6 s", tone: "bad" },
    ],
    loop: 8,
  },
};
