import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.5 beat 1: Three servers add 1 to the same row and must take turns.
export const sysdesignM27HotRow: SceneSpec = {
  kind: "scene",
  title: "One popular video is one hot row",
  purpose: "Three app servers each add 1 to the same row, the views of video v81. The database lets one write change the row at a time, so the others wait in line. More servers would not help, because they all need the same row.",
  limits: "Three servers stand for thousands of writes a second. A single DynamoDB partition is designed for about 1,000 write units a second, and one item lives in one partition. Other databases take turns on a row with locks or version checks (chapter 7.5).",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "app1", label: "App 1", kind: "server", sub: "+1 view", x: 70, y: 100 },
      { id: "app2", label: "App 2", kind: "server", sub: "+1 view", x: 70, y: 170 },
      { id: "app3", label: "App 3", kind: "server", sub: "+1 view", x: 70, y: 240 },
      { id: "row", label: "Video row", kind: "database", sub: "views: 41,207", x: 350, y: 170 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "app1", to: "row", label: "+1" },
      { kind: "fly", at: 0.4, dur: 0.9, from: "app2", to: "row", label: "+1" },
      { kind: "fly", at: 0.6, dur: 0.9, from: "app3", to: "row", label: "+1" },
      { kind: "say", at: 1.5, actor: "row", text: "one at a time", tone: "warn" },
      { kind: "mark", at: 1.5, actor: "row", tone: "warn" },
      { kind: "say", at: 2.0, actor: "app2", text: "waiting", tone: "bad" },
      { kind: "say", at: 2.0, actor: "app3", text: "waiting", tone: "bad" },
      { kind: "say", at: 3.0, actor: "row", text: "line grows", tone: "bad" },
      { kind: "verdict", at: 3.2, text: "One row: one write at a time", tone: "bad" },
    ],
    loop: 6.5,
  },
};
