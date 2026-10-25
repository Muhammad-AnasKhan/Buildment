import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 21.2 beat 6 (Keep the head of each timeline in memory)
export const sysdesignM21TimelineCache: SceneSpec = {
  kind: "scene",
  title: "The newest part of each timeline lives in memory",
  purpose: "The feed service asks the timeline cache for a reader's list of post ids. A reader seen today is a hit, answered in about half a millisecond. A reader who has been away is a miss, so the list is loaded from the timeline store and put back in memory.",
  limits: "Course numbers: 800 ids per timeline, 200 of them kept in memory for the 50 million daily users, about 80 GB. A cache hit takes about 0.5 ms and a read from the store a few milliseconds. The store time is an assumption.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "feed", label: "Feed", kind: "server", sub: "wants a list", x: 70, y: 100 },
      { id: "cache", label: "Timelines", kind: "cache", sub: "80 GB of heads", x: 350, y: 100 },
      { id: "store", label: "Store", kind: "database", sub: "320 GB, all", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "feed", to: "cache", label: "Dina's list?" },
      { kind: "say", at: 0.9, actor: "cache", text: "hit: 0.5 ms", tone: "good" },
      { kind: "fly", at: 1, dur: 0.7, from: "cache", to: "feed", label: "20 ids", tone: "good" },
      { kind: "say", at: 2, actor: "feed", text: "next: Sami", tone: "accent" },
      { kind: "fly", at: 2.4, dur: 0.7, from: "feed", to: "cache", label: "Sami's list?" },
      { kind: "say", at: 3.1, actor: "cache", text: "miss", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "cache", to: "store", label: "load list", tone: "warn" },
      { kind: "fly", at: 4.1, dur: 0.8, from: "store", to: "cache", label: "20 ids" },
      { kind: "say", at: 4.9, actor: "cache", text: "filled", tone: "good" },
      { kind: "verdict", at: 5.1, text: "Active readers hit memory", tone: "good" },
    ],
    loop: 8,
  },
};
