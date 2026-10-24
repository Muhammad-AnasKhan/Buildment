import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.5 beat 6: versioned keys. Each write raises the row's version, and the
// cache key includes it: p42:v7, then p42:v8. A reader asks for the current
// version first, so an old key is simply never read again; it expires on its
// own. Nothing has to be deleted, and a late set of v7 cannot hurt v8.
export const sysdesignM5VersionedKeys: SceneSpec = {
  kind: "scene",
  title: "New version, new key: nothing to delete",
  purpose: "A write raises the version from v7 to v8; readers look up the current version and use the key p42:v8, so the old copy is never read again.",
  limits: "The reader still needs the current version, which costs a small read: here from the database, often from a tiny version key or from data the page already has. Old copies use memory until they expire or are evicted.",
  scene: {
    width: 420,
    height: 210,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "price 899", x: 60, y: 110 },
      { id: "db", label: "Database", kind: "database", sub: "p42 v7: 999", x: 210, y: 110 },
      { id: "cache", label: "Cache", kind: "cache", sub: "p42:v7 = 999", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "db", label: "899, version+1" },
      { kind: "say", at: 0.9, actor: "db", text: "p42 v8: 899", tone: "good" },
      { kind: "say", at: 1.3, actor: "app", text: "shopper read" },
      { kind: "fly", at: 1.5, dur: 0.5, from: "app", to: "db", label: "version?" },
      { kind: "fly", at: 2.0, dur: 0.5, from: "db", to: "app", label: "v8" },
      { kind: "fly", at: 2.6, dur: 0.7, from: "app", to: "cache", label: "get p42:v8" },
      { kind: "fly", at: 3.3, dur: 0.7, from: "cache", to: "app", label: "miss", tone: "warn" },
      { kind: "fly", at: 4.1, dur: 0.7, from: "app", to: "cache", label: "set p42:v8" },
      { kind: "say", at: 4.8, actor: "cache", text: "v7 never read", tone: "good" },
      { kind: "say", at: 4.8, actor: "app", text: "shows 899", tone: "good" },
      { kind: "verdict", at: 5.1, text: "The old key is never read again", tone: "good" },
    ],
    loop: 8,
  },
};
