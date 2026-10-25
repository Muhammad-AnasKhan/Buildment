import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.1 beat 1: one orders database on one machine. The disk is 1.8 TB full of
// 2 TB and grows 40 GB a day, so it is full in 5 days: (2000 - 1800) / 40.
export const sysdesignM9OneTable: SceneSpec = {
  kind: "scene",
  title: "Suq's orders table fills its one disk",
  purpose: "All orders go to one database. Its disk is 1.8 TB full out of 2 TB and grows by 40 GB a day, so it is full in about 5 days.",
  limits: "Suq is a made-up marketplace and every number is made up for the story: 700 writes a second, a 2 TB disk, 40 GB of new orders a day. The writes limit (1,000 a second) is a second ceiling that arrives later.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "buyers", label: "Buyers", kind: "user", sub: "700 orders/s", x: 60, y: 100 },
      { id: "app", label: "Suq app", kind: "server", sub: "stateless", x: 210, y: 100 },
      { id: "db", label: "Orders DB", kind: "database", sub: "700 of 1000/s", x: 360, y: 100 },
    ],
    strip: { y: 250, from: 0, to: 2, unit: "TB", caption: "disk used, out of 2 TB", every: 0.5 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "buyers", to: "app", label: "order" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "app", to: "db", label: "write" },
      { kind: "tag", at: 1.5, row: 0, value: 1.8, label: "used 1.8 TB", tone: "warn" },
      { kind: "tag", at: 2.1, row: 1, value: 2, label: "disk full: 2 TB", tone: "bad" },
      { kind: "say", at: 2.1, actor: "db", text: "+40 GB a day", tone: "warn" },
      { kind: "mark", at: 2.9, actor: "db", tone: "bad" },
      { kind: "say", at: 2.9, actor: "db", text: "full in 5 days", tone: "bad" },
      { kind: "verdict", at: 3.3, text: "The disk is full in about 5 days", tone: "bad" },
    ],
    loop: 6.8,
  },
};
