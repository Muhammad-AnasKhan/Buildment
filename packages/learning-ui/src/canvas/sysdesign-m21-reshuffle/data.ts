import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.4 beat 5 (Page two must not reshuffle page one)
export const sysdesignM21Reshuffle: SceneSpec = {
  kind: "scene",
  title: "Ranking again can show the same post twice",
  purpose: "Maya reads page 1. When she asks for page 2 the feed ranks again from scratch, scores have moved, and three posts from page 1 come back. The fix is to pin the ranked list: page 2 comes from the same saved list of ids.",
  limits: "Three repeats is an example. How many repeat depends on how fast scores change. The pinned list is kept for a short time, here 10 minutes, and ends when it expires. The cursor then starts a fresh ranking.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "maya", label: "Maya", kind: "phone", sub: "reads page 1", x: 70, y: 100 },
      { id: "feed", label: "Feed", kind: "server", sub: "ranks", x: 350, y: 100 },
      { id: "list", label: "Saved list", kind: "cache", sub: "100 ids, 10 min", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "maya", to: "feed", label: "page 2" },
      { kind: "say", at: 0.9, actor: "feed", text: "ranks again", tone: "warn" },
      { kind: "fly", at: 1, dur: 0.7, from: "feed", to: "maya", label: "posts 18-37", tone: "bad" },
      { kind: "say", at: 1.7, actor: "maya", text: "3 repeats", tone: "bad" },
      { kind: "verdict", at: 1.9, text: "Re-ranking repeats posts", tone: "bad" },
      { kind: "say", at: 3.4, actor: "maya", text: "reads page 1", tone: "accent" },
      { kind: "say", at: 3.4, actor: "feed", text: "saves the list", tone: "good" },
      { kind: "fly", at: 3.5, dur: 0.7, from: "feed", to: "list", label: "100 ids" },
      { kind: "fly", at: 4.5, dur: 0.7, from: "maya", to: "feed", label: "page 2 + id" },
      { kind: "fly", at: 5.2, dur: 0.7, from: "feed", to: "list", label: "ids 21-40" },
      { kind: "fly", at: 5.9, dur: 0.7, from: "feed", to: "maya", label: "posts 21-40", tone: "good" },
      { kind: "say", at: 6.6, actor: "maya", text: "no repeats", tone: "good" },
      { kind: "verdict", at: 6.8, text: "Pin the list to the cursor", tone: "good" },
    ],
    loop: 10,
  },
};
