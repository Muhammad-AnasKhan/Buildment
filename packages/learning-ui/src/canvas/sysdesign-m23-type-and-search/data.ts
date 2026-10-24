import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.1 beat 1: Typing "shoes" sends five suggestion calls and one search.
export const sysdesignM23TypeAndSearch: SceneSpec = {
  kind: "scene",
  title: "Typing one word sends five suggestion calls and one search",
  purpose: "A shopper types s, h, o, e, s. After every letter the phone asks Suggest for ideas. Only when she taps Search does one full search run.",
  limits: "Dalil is a made-up marketplace. Real apps wait a moment after each key (debouncing) and may skip the first letter, so the count is lower, but it stays several calls for every search.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "types shoes", x: 70, y: 170 },
      { id: "suggest", label: "Suggest", kind: "server", sub: "prefix ideas", x: 350, y: 100 },
      { id: "search", label: "Search", kind: "server", sub: "full results", x: 350, y: 240 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "phone", to: "suggest", label: "s" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "phone", to: "suggest", label: "sh" },
      { kind: "fly", at: 1.4, dur: 0.5, from: "phone", to: "suggest", label: "sho" },
      { kind: "fly", at: 2.0, dur: 0.5, from: "phone", to: "suggest", label: "shoe" },
      { kind: "fly", at: 2.6, dur: 0.5, from: "phone", to: "suggest", label: "shoes" },
      { kind: "say", at: 3.1, actor: "suggest", text: "5 calls", tone: "warn" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "phone", to: "search", label: "search" },
      { kind: "fly", at: 4.5, dur: 0.9, from: "search", to: "phone", label: "results", tone: "good" },
      { kind: "say", at: 5.4, actor: "search", text: "1 call", tone: "good" },
      { kind: "verdict", at: 5.5, text: "5 suggestions for every search", tone: "warn" },
    ],
    loop: 8.5,
  },
};
