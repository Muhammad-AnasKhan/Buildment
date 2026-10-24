import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.4 beat 6 (A slow ranker must not break the feed)
export const sysdesignM21RankerSlow: SceneSpec = {
  kind: "scene",
  title: "When the ranker is slow, show time order",
  purpose: "The feed service gives the ranker 50 ms. The ranker needs 400 ms today. The feed service stops waiting and answers with the same posts in time order. The reader sees a feed, a little less relevant, on time.",
  limits: "Course numbers: a 200 ms budget for the whole feed open and a 50 ms limit on the ranker. Time order is the fallback because the candidate ids are already sorted by time. Chapter 16.6 covers graceful degradation in general.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "opens feed", x: 70, y: 100 },
      { id: "feed", label: "Feed", kind: "server", sub: "budget 200 ms", x: 350, y: 100 },
      { id: "ranker", label: "Ranker", kind: "server", sub: "needs 400 ms", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "phone", to: "feed", label: "open feed" },
      { kind: "fly", at: 1, dur: 0.8, from: "feed", to: "ranker", label: "score 500" },
      { kind: "say", at: 1.8, actor: "ranker", text: "scoring...", tone: "warn" },
      { kind: "say", at: 1.8, actor: "feed", text: "waits 50 ms", tone: "warn" },
      { kind: "say", at: 3, actor: "feed", text: "gives up", tone: "bad" },
      { kind: "mark", at: 3, actor: "ranker", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "feed", to: "phone", label: "newest 20", tone: "warn" },
      { kind: "say", at: 4, actor: "phone", text: "feed shown", tone: "good" },
      { kind: "verdict", at: 4.2, text: "Ranker slow: show time order", tone: "good" },
    ],
    loop: 7.5,
  },
};
