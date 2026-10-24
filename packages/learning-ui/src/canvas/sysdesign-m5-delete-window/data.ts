import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.5 beat 2: delete on write. The app commits the new price, then deletes
// the cached copy. The copy is stale only between the commit and the end of
// the delete: about one cache round trip, about 0.5 ms in napkin-math.
export const sysdesignM5DeleteWindow: SceneSpec = {
  kind: "scene",
  title: "Delete on write: stale for about half a millisecond",
  purpose: "The app commits the new price and then deletes the copy; the copy is wrong only for the time the delete takes.",
  limits: "Uses napkin-math's rough 0.5 ms for a cache command. If the app crashes between the commit and the delete, or the delete fails, the copy stays stale until its TTL ends; and a slow reader can put the old value back (next picture).",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "price 899", x: 60, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "p42 = 999", x: 210, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "p42 = 999", x: 360, y: 100 },
    ],
    strip: { y: 268, from: 0, to: 2, unit: "ms", caption: "milliseconds after the commit", every: 0.5 },
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "app", to: "db", label: "1 UPDATE" },
      { kind: "say", at: 1.2, actor: "db", text: "p42 = 899", tone: "good" },
      { kind: "say", at: 1.2, actor: "cache", text: "stale: 999", tone: "warn" },
      { kind: "tag", at: 1.2, row: 0, value: 0, label: "commit 0 ms" },
      { kind: "fly", at: 1.8, dur: 1.0, from: "app", to: "cache", label: "2 DEL p42" },
      { kind: "say", at: 2.8, actor: "cache", text: "empty", tone: "good" },
      { kind: "tag", at: 2.9, row: 1, value: 0.5, label: "deleted 0.5 ms", tone: "good" },
      { kind: "say", at: 3.5, actor: "app", text: "window: 0.5 ms", tone: "good" },
      { kind: "verdict", at: 4.0, text: "Stale for about 0.5 ms, not 60 s", tone: "good" },
    ],
    loop: 7.5,
  },
};
