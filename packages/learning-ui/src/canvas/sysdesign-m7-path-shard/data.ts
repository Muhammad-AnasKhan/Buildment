import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.6 beat 5. Partitioning is the first step that adds write capacity, because each partition takes a share of the writes. It costs you cross-partition queries.
export const sysdesignM7PathShard: SceneSpec = {
  kind: "scene",
  title: "Step 4: partitions spread the writes",
  purpose: "Events are split over three databases by event id. A question about event 5 goes to one of them. A question about all events goes to all three.",
  limits: "Partitioning is module 9. The split by event id is an example; a bad key can make one partition hot. Joins and transactions across partitions are harder.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "routes by event", x: 210, y: 100 },
      { id: "a", label: "Partition A", kind: "database", sub: "events 1 to 3", x: 62, y: 255 },
      { id: "b", label: "Partition B", kind: "database", sub: "events 4 to 6", x: 210, y: 255 },
      { id: "c", label: "Partition C", kind: "database", sub: "events 7 to 9", x: 358, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "b", label: "event 5" },
      { kind: "say", at: 1.1, actor: "b", text: "1 of 3 asked", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "b", to: "app", label: "answer", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "app", to: "a", label: "top prices?" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "app", to: "b", label: "top prices?" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "app", to: "c", label: "top prices?" },
      { kind: "say", at: 3.3, actor: "a", text: "answers", tone: "warn" },
      { kind: "say", at: 3.3, actor: "b", text: "answers", tone: "warn" },
      { kind: "say", at: 3.3, actor: "c", text: "answers", tone: "warn" },
      { kind: "verdict", at: 4, text: "One key: 1 partition. No key: all 3", tone: "warn" },
    ],
    loop: 6.8,
  },
};
