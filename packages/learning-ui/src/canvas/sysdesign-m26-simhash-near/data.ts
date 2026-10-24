import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.4 beat 5 (Almost the same page).
export const sysdesignM26SimhashNear: SceneSpec = {
  kind: "scene",
  title: "A similarity fingerprint tolerates small edits",
  purpose: "A simhash is a 64-bit fingerprint that changes only a few bits when a page changes a little. Counting the bits where two fingerprints differ tells how alike the pages are.",
  limits: "Numbers come from a seeded test on made-up 600-word texts, with 3-word shingles. The right threshold depends on the pages, so a team picks it from examples. Short pages give noisy results.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "a", label: "Page A", kind: "note", sub: "stored", x: 70, y: 100 },
      { id: "cmp", label: "Compare", kind: "worker", sub: "64-bit prints", x: 210, y: 100 },
      { id: "b", label: "Page B", kind: "note", sub: "new, same text", x: 350, y: 100 },
      { id: "c", label: "Page C", kind: "note", sub: "new article", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "a", to: "cmp", label: "print of A" },
      { kind: "fly", at: 0.2, dur: 0.9, from: "b", to: "cmp", label: "print of B" },
      { kind: "say", at: 1.2, actor: "cmp", text: "10 bits differ", tone: "accent" },
      { kind: "say", at: 1.3, actor: "b", text: "near copy", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "c", to: "cmp", label: "print of C" },
      { kind: "say", at: 3.4, actor: "cmp", text: "32 bits differ", tone: "accent" },
      { kind: "say", at: 3.5, actor: "c", text: "a new page", tone: "good" },
      { kind: "verdict", at: 3.8, text: "Small distance means near copy", tone: "good" },
    ],
    loop: 8.5,
  },
};
