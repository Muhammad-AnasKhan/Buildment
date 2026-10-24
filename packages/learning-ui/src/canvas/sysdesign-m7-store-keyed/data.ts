import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.2 beat 3. A key-value store answers one question well: give me the value for this key. Any other question is a scan unless the store has an index for it.
export const sysdesignM7StoreKeyed: SceneSpec = {
  kind: "scene",
  title: "A key-value store is fast by key and slow by anything else",
  purpose: "Fetching order 8841 by its key is one read. Asking for all orders of event 7 means looking at every key.",
  limits: "A document store behaves the same way for the main key, but it can also build indexes on fields inside the document, so 'orders of event 7' can be fast if you add that index. A plain key-value store has no such index.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "app", label: "Ticketline app", kind: "server", sub: "needs orders", x: 60, y: 130 },
      { id: "kv", label: "Key-value store", kind: "database", sub: "key to value", x: 360, y: 130 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "kv", label: "get order:8841" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "kv", to: "app", label: "whole order", tone: "good" },
      { kind: "say", at: 2.2, actor: "app", text: "got it, fast", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.8, from: "app", to: "kv", label: "event 7 orders?" },
      { kind: "say", at: 3.4, actor: "kv", text: "scans all keys", tone: "bad" },
      { kind: "mark", at: 3.4, actor: "kv", tone: "bad" },
      { kind: "verdict", at: 3.8, text: "By key: fast. By event: a scan", tone: "bad" },
    ],
    loop: 6.6,
  },
};
