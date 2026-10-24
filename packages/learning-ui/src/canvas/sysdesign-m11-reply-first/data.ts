import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.4 beat 3 ("A reply before its question"). Related writes stored in two places can reach a reader in the wrong order. This is a consistent prefix violation.
export const sysdesignM11ReplyFirst: SceneSpec = {
  kind: "scene",
  title: "The reader sees the reply, not its question",
  purpose: "A question and its reply live on two shards. The reply reaches its copy fast, the question reaches its copy slowly, and a reader sees the reply with no question.",
  limits: "A made-up study forum. The slow copy takes several seconds here so you can watch it. One shard for both, or the fix in the next picture, prevents this.",
  scene: {
    width: 420,
    height: 410,
    actors: [
      { id: "asker", label: "Asker", kind: "phone", sub: "posts question", x: 70, y: 100 },
      { id: "replier", label: "Replier", kind: "phone", sub: "waits", x: 350, y: 100 },
      { id: "qc", label: "Questions", kind: "database", sub: "no question", x: 70, y: 220 },
      { id: "rc", label: "Replies", kind: "database", sub: "no reply", x: 350, y: 220 },
      { id: "reader", label: "Reader", kind: "user", sub: "opens thread", x: 210, y: 335 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 5, from: "asker", to: "qc", label: "question (slow)", tone: "warn" },
      { kind: "say", at: 0.9, actor: "replier", text: "read question", tone: "accent" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "replier", to: "rc", label: "reply" },
      { kind: "say", at: 2.1, actor: "rc", text: "has reply", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "reader", to: "rc", label: "read" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "rc", to: "reader", label: "reply", tone: "good" },
      { kind: "say", at: 4, actor: "reader", text: "sees reply", tone: "good" },
      { kind: "fly", at: 4, dur: 0.8, from: "reader", to: "qc", label: "read" },
      { kind: "fly", at: 4.8, dur: 0.5, from: "qc", to: "reader", label: "none", tone: "bad" },
      { kind: "say", at: 5.3, actor: "reader", text: "no question", tone: "bad" },
      { kind: "mark", at: 5.3, actor: "reader", tone: "bad" },
      { kind: "say", at: 5.5, actor: "qc", text: "has question", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Reply shown before its question", tone: "bad" },
    ],
    loop: 8.6,
  },
};
