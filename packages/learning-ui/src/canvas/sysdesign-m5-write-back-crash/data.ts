import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.3 beat 4: write-back (write-behind). The cache says "done" before the
// database has the write and flushes it later. If the cache node dies before
// the flush, a write the shopper was told about is gone. Taught as a
// trade-off; the dossier has no primary source for the term.
export const sysdesignM5WriteBackCrash: SceneSpec = {
  kind: "scene",
  title: "Write-back is fast until the cache dies",
  purpose: "The cache confirms the order at once and plans to write it to the database a moment later; it crashes first, and the confirmed write is lost.",
  limits: "A cache that keeps writes only in memory, with no copy on disk and no replica. Some caches can write a log to disk or copy writes to a replica, which shrinks this risk but does not make the cache the source of truth.",
  scene: {
    width: 420,
    height: 210,
    actors: [
      { id: "shopper", label: "Shopper", kind: "phone", sub: "buys 1 phone", x: 60, y: 110 },
      { id: "cache", label: "Cache", kind: "cache", sub: "write-back", x: 210, y: 110 },
      { id: "db", label: "Database", kind: "database", sub: "stock 5", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "shopper", to: "cache", label: "order, stock -1" },
      { kind: "say", at: 0.9, actor: "cache", text: "stock 4", tone: "accent" },
      { kind: "fly", at: 1.0, dur: 0.6, from: "cache", to: "shopper", label: "done", tone: "good" },
      { kind: "say", at: 1.6, actor: "shopper", text: "fast: done", tone: "good" },
      { kind: "say", at: 2.2, actor: "cache", text: "flush in 1 s", tone: "warn" },
      { kind: "say", at: 3.1, actor: "cache", text: "crashed", tone: "bad" },
      { kind: "mark", at: 3.1, actor: "cache", tone: "bad" },
      { kind: "say", at: 3.7, actor: "db", text: "still stock 5", tone: "bad" },
      { kind: "mark", at: 3.7, actor: "db", tone: "warn" },
      { kind: "say", at: 4.1, actor: "shopper", text: "order lost", tone: "bad" },
      { kind: "verdict", at: 4.3, text: "Said done, but the write is gone", tone: "bad" },
    ],
    loop: 7.5,
  },
};
