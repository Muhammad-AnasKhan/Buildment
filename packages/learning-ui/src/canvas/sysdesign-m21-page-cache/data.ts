import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.4 beat 4 (Cache the finished page for a few seconds)
export const sysdesignM21PageCache: SceneSpec = {
  kind: "scene",
  title: "A cached page is fast, and up to 10 seconds old",
  purpose: "Maya opens her feed and the page is built in about 60 ms (candidates, ranking and fetching the posts). She refreshes a moment later and the cached page comes back in a few milliseconds. A new post from Dina does not show until the cached page expires.",
  limits: "Course numbers: 60 ms to build a page, 5 ms to read it from the cache, a time to live of 10 seconds. The reader's own new post must still appear at once, so the cache entry is removed when she posts (chapter 8.4 and the delete-on-write rule of chapter 5.5).",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "maya", label: "Maya", kind: "phone", sub: "opens feed", x: 70, y: 85 },
      { id: "feed", label: "Feed", kind: "server", sub: "ranks pages", x: 350, y: 85 },
      { id: "cache", label: "Page cache", kind: "cache", sub: "TTL 10 s", x: 350, y: 235 },
      { id: "dina", label: "Dina", kind: "phone", sub: "posts later", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "maya", to: "feed", label: "open feed" },
      { kind: "fly", at: 1, dur: 0.6, from: "feed", to: "cache", label: "page?" },
      { kind: "say", at: 1.6, actor: "cache", text: "miss", tone: "bad" },
      { kind: "say", at: 1.7, actor: "feed", text: "build: 60 ms", tone: "warn" },
      { kind: "fly", at: 2, dur: 0.6, from: "feed", to: "cache", label: "save page" },
      { kind: "say", at: 2.6, actor: "cache", text: "saved", tone: "accent" },
      { kind: "fly", at: 2.7, dur: 0.7, from: "feed", to: "maya", label: "page 1" },
      { kind: "say", at: 3.5, actor: "feed", text: "next open", tone: "accent" },
      { kind: "fly", at: 3.9, dur: 0.6, from: "feed", to: "cache", label: "page?" },
      { kind: "say", at: 4.5, actor: "cache", text: "hit", tone: "good" },
      { kind: "say", at: 4.6, actor: "feed", text: "read: 5 ms", tone: "good" },
      { kind: "say", at: 5.4, actor: "dina", text: "new post", tone: "accent" },
      { kind: "say", at: 5.8, actor: "maya", text: "old page", tone: "warn" },
      { kind: "verdict", at: 6, text: "Fast now, fresh within 10 s", tone: "good" },
    ],
    loop: 9,
  },
};
