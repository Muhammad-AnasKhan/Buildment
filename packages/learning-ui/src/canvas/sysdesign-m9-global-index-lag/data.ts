import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.6 beat 3: a global secondary index is its own partitioned table, keyed by
// buyer. A write goes to the order's shard first; the index is updated a
// little later (DynamoDB global secondary indexes are updated asynchronously
// and are eventually consistent). A search right after the write misses it.
export const sysdesignM9GlobalIndexLag: SceneSpec = {
  kind: "scene",
  title: "A global index can miss a new write",
  purpose: "The order is saved on its own shard first. The index, which lives on other shards and is keyed by buyer, is updated a moment later, so a search made right after the write misses it.",
  limits: "The delay is drawn long so you can see it. DynamoDB documents its global secondary indexes as updated asynchronously and eventually consistent, and gives no figure; the delay in real systems is usually short but has no promised limit.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "app", label: "Suq app", kind: "server", sub: "Sara orders", x: 60, y: 110 },
      { id: "data", label: "Order shard", kind: "database", sub: "by order id", x: 210, y: 110 },
      { id: "idx", label: "Index shard", kind: "database", sub: "by buyer", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "data", label: "save order" },
      { kind: "say", at: 0.9, actor: "data", text: "saved", tone: "good" },
      { kind: "fly", at: 1.0, dur: 2.2, from: "data", to: "idx", label: "index it later", tone: "warn" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "app", to: "idx", label: "Sara's orders?" },
      { kind: "say", at: 2.1, actor: "idx", text: "none yet", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 0.7, from: "idx", to: "app", label: "empty", tone: "bad" },
      { kind: "say", at: 2.9, actor: "app", text: "order missing", tone: "bad" },
      { kind: "mark", at: 2.9, actor: "app", tone: "bad" },
      { kind: "verdict", at: 3.0, text: "The index read missed the new order", tone: "bad" },
      { kind: "say", at: 3.4, actor: "idx", text: "now indexed", tone: "good" },
    ],
    loop: 6.4,
  },
};
