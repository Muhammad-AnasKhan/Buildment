import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 8.2, beat 2: Yazan (a fictional fellow) asks one
// question about Mawid (a made-up scheduling tool) of three sources. Only the
// docs give a version and a limit he can check and date. Watch-only scene.
export const adoptAToolLoopSources: SceneSpec = {
  kind: "scene",
  title: "Three sources, one question",
  purpose: "Yazan asks a post, an AI answer and the docs the same question about a made-up tool, and only the docs give him a version and a limit he can check.",
  limits:
    "A made-up tool and three sources. A real AI answer is sometimes right, and a post sometimes links to the docs. The lesson is which source gives a version and a date you can check, not that one kind of source is always wrong.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "yazan", label: "Yazan", kind: "user", sub: "asks 3 sources", x: 68, y: 170 },
      { id: "post", label: "Post", kind: "note", sub: "ten lines", x: 330, y: 96 },
      { id: "ai", label: "AI answer", kind: "note", sub: "fluent", x: 330, y: 170 },
      { id: "docs", label: "Docs", kind: "server", sub: "version 3.2", x: 330, y: 244 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "yazan", to: "post", label: "restart?" },
      { kind: "say", at: 1.2, actor: "post", text: "no limit given", tone: "warn" },
      { kind: "fly", at: 2.0, dur: 0.8, from: "yazan", to: "ai", label: "restart?" },
      { kind: "say", at: 2.8, actor: "ai", text: "yes, on disk", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "yazan", to: "docs", label: "restart?" },
      { kind: "say", at: 4.4, actor: "docs", text: "memory, v3.2", tone: "good" },
      { kind: "mark", at: 4.4, actor: "docs", tone: "good" },
      { kind: "fly", at: 5.0, dur: 0.8, from: "docs", to: "yazan", label: "limit, date", tone: "good" },
      { kind: "say", at: 5.8, actor: "yazan", text: "dated limit", tone: "good" },
      { kind: "verdict", at: 6.2, text: "Only the docs give a version", tone: "good" },
    ],
    loop: 8.8,
  },
};
