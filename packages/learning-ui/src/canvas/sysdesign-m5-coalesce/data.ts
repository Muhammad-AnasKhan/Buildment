import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.6 beat 2: request coalescing (single-flight). The first miss for a key
// starts the query; every other request for the same key waits for that one
// answer instead of sending its own. One query serves all 250 requests.
export const sysdesignM5Coalesce: SceneSpec = {
  kind: "scene",
  title: "Coalescing: one query, everyone waits for it",
  purpose: "The first miss starts the only query; the other requests for the same key wait for its answer, and the database sees one query instead of 250.",
  limits: "One app server. With many app servers, in-process coalescing allows one query per server; a lock or lease in the shared cache brings it down to one for the whole fleet. Waiters still wait the full 50 ms.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "shoppers", label: "Shoppers", kind: "user", sub: "5,000 a second", x: 60, y: 100 },
      { id: "app", label: "App", kind: "server", sub: "single-flight", x: 210, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "sale page", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "calm", x: 210, y: 225 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "cache", text: "expired", tone: "warn" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 1.2, dur: 0.5, from: "app", to: "db", label: "the one query" },
      { kind: "fly", at: 1.5, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "fly", at: 1.7, dur: 0.5, from: "shoppers", to: "app", label: "page?" },
      { kind: "say", at: 2.2, actor: "app", text: "249 waiting", tone: "warn" },
      { kind: "say", at: 2.2, actor: "db", text: "1 query", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.5, from: "db", to: "app", label: "page" },
      { kind: "fly", at: 3.3, dur: 0.5, from: "app", to: "cache", label: "set" },
      { kind: "say", at: 3.8, actor: "cache", text: "fresh again", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.6, from: "app", to: "shoppers", label: "page x 250", tone: "good" },
      { kind: "say", at: 4.0, actor: "app", text: "all 250 served", tone: "good" },
      { kind: "verdict", at: 4.3, text: "One query served 250 requests", tone: "good" },
    ],
    loop: 7.8,
  },
};
