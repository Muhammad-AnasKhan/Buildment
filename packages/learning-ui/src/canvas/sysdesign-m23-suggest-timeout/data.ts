import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.3 beat 6: When suggestions are slow, the phone gives up after 100 ms and search still works.
export const sysdesignM23SuggestTimeout: SceneSpec = {
  kind: "scene",
  title: "A slow suggestion is dropped, and search still works",
  purpose: "The suggest service is slow today. The phone waits 100 ms, then drops the request and shows no suggestions. The shopper finishes typing and the search itself works as normal.",
  limits: "A late answer would arrive after the shopper has typed more letters and would be wrong for the new text, so the phone ignores it. Alerts should still fire: dropped suggestions are a quiet failure.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "typing", x: 70, y: 110 },
      { id: "suggest", label: "Suggest", kind: "server", sub: "slow today", x: 350, y: 110 },
      { id: "search", label: "Search", kind: "server", sub: "healthy", x: 210, y: 240 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "phone", to: "suggest", label: "sho" },
      { kind: "say", at: 1.2, actor: "suggest", text: "no answer", tone: "bad" },
      { kind: "wait", at: 1.3, dur: 1.8, actor: "phone", label: "waiting {n} ms", doneLabel: "100 ms: drop it", total: 100 },
      { kind: "say", at: 3.1, actor: "phone", text: "no ideas shown", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 0.9, from: "phone", to: "search", label: "shoes" },
      { kind: "fly", at: 4.6, dur: 0.9, from: "search", to: "phone", label: "results", tone: "good" },
      { kind: "say", at: 5.5, actor: "phone", text: "shows results", tone: "good" },
      { kind: "verdict", at: 5.6, text: "No ideas, but search still works", tone: "good" },
    ],
    loop: 8.5,
  },
};
