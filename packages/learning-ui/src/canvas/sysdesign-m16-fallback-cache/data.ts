import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 16.6 beat 3 (A fallback).
export const sysdesignM16FallbackCache: SceneSpec = {
  kind: "scene",
  title: "A fallback shows popular items when Picks is down",
  purpose: "Picks is down and its breaker is open. Checkout asks a cache for yesterday's popular items instead, and the page still has a row where the picks would be.",
  limits: "One fallback: a cached copy. Others are a default value, hiding the feature and an alternative way to do the job. The 1 hour age is a course number.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "checkout", label: "Checkout", kind: "server", sub: "breaker open", x: 70, y: 100 },
      { id: "picks", label: "Picks", kind: "server", sub: "down", x: 350, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "popular items", x: 210, y: 190 }
    ],
    events: [
      { kind: "say", at: 0.3, actor: "picks", text: "down", tone: "bad" },
      { kind: "mark", at: 0.3, actor: "picks", tone: "bad" },
      { kind: "say", at: 0.6, actor: "checkout", text: "skip Picks", tone: "warn" },
      { kind: "fly", at: 1.2, dur: 1, from: "checkout", to: "cache", label: "popular?" },
      { kind: "fly", at: 2.4, dur: 1, from: "cache", to: "checkout", label: "top 10", tone: "good" },
      { kind: "say", at: 3.4, actor: "cache", text: "1 h old", tone: "accent" },
      { kind: "say", at: 3.6, actor: "checkout", text: "page built", tone: "good" },
      { kind: "verdict", at: 4, text: "Popular items replace the picks", tone: "good" }
    ],
    loop: 7.2,
  },
};
