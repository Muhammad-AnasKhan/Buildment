import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.5 beat 4: A merger folds the shards into one total row every few seconds.
export const sysdesignM27MergeTotal: SceneSpec = {
  kind: "scene",
  title: "Merge the shards every few seconds",
  purpose: "A merger runs every 5 seconds. It reads each shard once, adds the three numbers, writes the sum to a total row and takes exactly what it read out of the shards. The watch page reads only the total, a few seconds late.",
  limits: "Three shards and one merge pass. The merge must subtract the amount it read, not set the shard to zero, or a view that lands during the merge is lost (chapter 27.6). The total is up to one merge interval behind; Lamha accepts that for the page count.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "s1", label: "Shard 1", kind: "database", sub: "412", x: 60, y: 100 },
      { id: "s2", label: "Shard 2", kind: "database", sub: "398", x: 210, y: 100 },
      { id: "s3", label: "Shard 3", kind: "database", sub: "394", x: 360, y: 100 },
      { id: "merger", label: "Merger", kind: "worker", sub: "every 5 s", x: 60, y: 235 },
      { id: "total", label: "Total row", kind: "database", sub: "1,203,127", x: 360, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "s1", to: "merger", label: "412" },
      { kind: "fly", at: 0.6, dur: 0.8, from: "s2", to: "merger", label: "398" },
      { kind: "fly", at: 0.9, dur: 0.8, from: "s3", to: "merger", label: "394" },
      { kind: "say", at: 1.8, actor: "merger", text: "sum: 1,204", tone: "good" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "merger", to: "total", label: "+1,204" },
      { kind: "say", at: 2.9, actor: "total", text: "1,204,331", tone: "good" },
      { kind: "say", at: 3.1, actor: "s1", text: "now 0", tone: "accent" },
      { kind: "say", at: 3.1, actor: "s2", text: "now 0", tone: "accent" },
      { kind: "say", at: 3.1, actor: "s3", text: "now 0", tone: "accent" },
      { kind: "verdict", at: 3.4, text: "Page reads one row, a bit late", tone: "good" },
    ],
    loop: 6.5,
  },
};
