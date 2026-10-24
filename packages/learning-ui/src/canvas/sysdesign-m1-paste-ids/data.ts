import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 5 of 1.4: deep dive on paste IDs. Two app servers pick the same
// random 6-character ID; the database's unique key rejects the second
// insert, and that server retries with a new ID.
export const sysdesignM1PasteIds: SceneSpec = {
  kind: "scene",
  title: "Deep dive: two servers pick the same paste ID",
  purpose: "App 2 picks an ID that App 1 already used; the database's unique key refuses it, and App 2 tries a new one.",
  limits: "The clash is staged so you can see it; with 6 random characters it is rare for any one paste, but at 100,000 pastes a day it happens a few times a day. The servers do not talk to each other; only the database sees both IDs.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "app1", label: "App 1", kind: "server", sub: "new paste", x: 70, y: 100 },
      { id: "app2", label: "App 2", kind: "server", sub: "new paste", x: 70, y: 235 },
      { id: "db", label: "Database", kind: "database", sub: "ID is unique", x: 320, y: 168 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.9, from: "app1", to: "db", label: "insert aB3xY9" },
      { kind: "say", at: 0.9, actor: "db", text: "saved aB3xY9", tone: "good" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "db", to: "app1", label: "OK", tone: "good" },
      { kind: "say", at: 1.7, actor: "app1", text: "done", tone: "good" },

      { kind: "fly", at: 1.8, dur: 0.9, from: "app2", to: "db", label: "insert aB3xY9" },
      { kind: "say", at: 2.7, actor: "db", text: "ID taken!", tone: "bad" },
      { kind: "mark", at: 2.7, actor: "db", tone: "bad" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "db", to: "app2", label: "clash", tone: "bad" },
      { kind: "say", at: 3.5, actor: "app2", text: "new ID: Qp7k2M", tone: "warn" },

      { kind: "fly", at: 3.8, dur: 0.9, from: "app2", to: "db", label: "insert Qp7k2M" },
      { kind: "say", at: 4.7, actor: "db", text: "saved Qp7k2M", tone: "good" },
      { kind: "mark", at: 4.7, actor: "db", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.7, from: "db", to: "app2", label: "OK", tone: "good" },
      { kind: "say", at: 5.5, actor: "app2", text: "done", tone: "good" },
      { kind: "verdict", at: 5.5, text: "The unique key catches the clash", tone: "good" },
    ],
    loop: 8.5,
  },
};
