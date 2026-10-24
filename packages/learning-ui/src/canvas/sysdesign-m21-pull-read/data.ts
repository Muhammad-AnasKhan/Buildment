import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.3 beat 2 (Pull: gather posts when someone looks)
export const sysdesignM21PullRead: SceneSpec = {
  kind: "scene",
  title: "Pull: the feed asks every followed account",
  purpose: "Omar opens the feed. Nothing was prepared. The feed service asks each account Omar follows for its latest posts, then merges the answers by time.",
  limits: "Three followed accounts to keep the picture readable. Omar's real feed asks about 150. Each ask is a separate lookup that can be slow, which is the cost of this approach.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "omar", label: "Omar", kind: "phone", sub: "opens feed", x: 70, y: 85 },
      { id: "feed", label: "Feed", kind: "server", sub: "merges lists", x: 70, y: 235 },
      { id: "a1", label: "Dina", kind: "database", sub: "latest posts", x: 350, y: 80 },
      { id: "a2", label: "News", kind: "database", sub: "latest posts", x: 350, y: 160 },
      { id: "a3", label: "Bakery", kind: "database", sub: "latest posts", x: 350, y: 240 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "omar", to: "feed", label: "open feed" },
      { kind: "fly", at: 1.1, dur: 0.7, from: "feed", to: "a1", label: "latest?" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "feed", to: "a2", label: "latest?" },
      { kind: "fly", at: 1.7, dur: 0.7, from: "feed", to: "a3", label: "latest?" },
      { kind: "fly", at: 2.5, dur: 0.7, from: "a1", to: "feed", label: "posts", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "a2", to: "feed", label: "posts", tone: "good" },
      { kind: "fly", at: 3.1, dur: 0.7, from: "a3", to: "feed", label: "posts", tone: "good" },
      { kind: "say", at: 3.8, actor: "feed", text: "3 lookups", tone: "warn" },
      { kind: "fly", at: 4, dur: 0.7, from: "feed", to: "omar", label: "feed" },
      { kind: "verdict", at: 4.7, text: "Pull: one lookup per account", tone: "warn" },
    ],
    loop: 8,
  },
};
