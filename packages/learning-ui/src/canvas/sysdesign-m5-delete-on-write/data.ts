import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.3 beat 2: the cache-aside write path. The app updates the database, then
// deletes the cached copy (Facebook chose delete over update because deletes
// are idempotent). The next read misses and loads the new price.
export const sysdesignM5DeleteOnWrite: SceneSpec = {
  kind: "scene",
  title: "Update the database, then delete the copy",
  purpose: "A price change goes to the database first; the app then deletes the cached copy, so the next read loads the new price.",
  limits: "One writer and one reader, one after the other. When a read and a write overlap, the reader can put the old price back; chapter 5.5 shows that race.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "admin", label: "Admin", kind: "user", sub: "new price 899", x: 60, y: 100 },
      { id: "app", label: "App", kind: "server", sub: "cache-aside", x: 210, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "p42 = 999", x: 360, y: 100 },
      { id: "shopper", label: "Shopper", kind: "phone", sub: "browsing", x: 60, y: 220 },
      { id: "cache", label: "Cache", kind: "cache", sub: "p42 = 999", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "admin", to: "app", label: "price 899" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "app", to: "db", label: "1 UPDATE" },
      { kind: "say", at: 1.3, actor: "db", text: "p42 = 899", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.5, from: "app", to: "cache", label: "2 DEL p42" },
      { kind: "say", at: 2.0, actor: "cache", text: "empty" },
      { kind: "fly", at: 2.5, dur: 0.5, from: "shopper", to: "app", label: "page?" },
      { kind: "fly", at: 3.0, dur: 0.4, from: "app", to: "cache", label: "get" },
      { kind: "fly", at: 3.4, dur: 0.4, from: "cache", to: "app", label: "miss", tone: "warn" },
      { kind: "fly", at: 3.9, dur: 0.5, from: "app", to: "db", label: "read" },
      { kind: "fly", at: 4.4, dur: 0.5, from: "db", to: "app", label: "899" },
      { kind: "fly", at: 4.9, dur: 0.4, from: "app", to: "cache", label: "set 899" },
      { kind: "say", at: 5.3, actor: "cache", text: "p42 = 899", tone: "good" },
      { kind: "fly", at: 5.3, dur: 0.5, from: "app", to: "shopper", label: "899", tone: "good" },
      { kind: "say", at: 5.8, actor: "shopper", text: "sees 899", tone: "good" },
      { kind: "verdict", at: 6.0, text: "Copy deleted: next read is fresh", tone: "good" },
    ],
    loop: 9,
  },
};
