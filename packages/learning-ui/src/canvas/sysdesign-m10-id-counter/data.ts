import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.7 beat 1: one counter makes unique, ordered IDs, but every ID costs a
// trip to it, and when it is down nobody can make an ID.
export const sysdesignM10IdCounter: SceneSpec = {
  kind: "scene",
  title: "One counter makes IDs, and is one point of failure",
  purpose: "Two app servers ask one database for the next number. Each gets a unique ID, 41 then 42, with a trip each. When the database is down, neither can make an ID.",
  limits: "Auto-increment is fine for one database. The problems here start when many servers, or many regions, all depend on one counter. Giving each server a block of numbers in advance reduces the trips but adds its own bookkeeping.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "app1", label: "App 1", kind: "server", sub: "needs an ID", x: 70, y: 90 },
      { id: "app2", label: "App 2", kind: "server", sub: "needs an ID", x: 70, y: 190 },
      { id: "db", label: "ID counter", kind: "database", sub: "next: 41", x: 340, y: 140 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "app1", to: "db", label: "next ID?" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "db", to: "app1", label: "ID 41", tone: "good" },
      { kind: "say", at: 1.3, actor: "db", text: "next: 42" },
      { kind: "say", at: 2.2, actor: "app1", text: "has ID 41", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "app2", to: "db", label: "next ID?" },
      { kind: "fly", at: 3.2, dur: 0.9, from: "db", to: "app2", label: "ID 42", tone: "good" },
      { kind: "say", at: 3.2, actor: "db", text: "next: 43" },
      { kind: "say", at: 4.1, actor: "app2", text: "has ID 42", tone: "good" },
      { kind: "say", at: 4.8, actor: "db", text: "down", tone: "bad" },
      { kind: "mark", at: 4.8, actor: "db", tone: "bad" },
      { kind: "say", at: 5, actor: "app1", text: "waiting", tone: "bad" },
      { kind: "say", at: 5, actor: "app2", text: "waiting", tone: "bad" },
      { kind: "verdict", at: 5.4, text: "Counter down: nobody gets an ID", tone: "bad" },
    ],
    loop: 8.8,
  },
};
