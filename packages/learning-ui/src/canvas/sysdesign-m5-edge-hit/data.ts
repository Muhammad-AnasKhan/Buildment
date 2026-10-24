import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.2 beat 2: a shopper in Singapore asks a CDN edge in the same city. The
// first request misses and the edge fetches the page from the origin in EU
// West (about 160 ms round trip, napkin-math). The next shopper hits the edge
// and never pays that trip.
export const sysdesignM5EdgeHit: SceneSpec = {
  kind: "scene",
  title: "A hit at the edge skips the long trip",
  purpose: "The first request misses at the edge and pays the 160 ms trip to the origin; the next one is answered by the edge.",
  limits: "EU West to Singapore is about 160 ms per round trip (napkin-math, rounded, can be 2 to 3 times off). The trip from the phone to the edge is left out because both requests pay it. Real pages need several requests, and a new connection adds more round trips.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Shopper", kind: "phone", sub: "Singapore", x: 60, y: 100 },
      { id: "edge", label: "CDN edge", kind: "cdn", sub: "Singapore", x: 210, y: 100 },
      { id: "origin", label: "Origin", kind: "server", sub: "EU West", x: 360, y: 100 },
    ],
    strip: { y: 268, from: 0, to: 200, unit: "ms", caption: "time added after the edge", every: 50 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "phone", to: "edge", label: "GET page" },
      { kind: "say", at: 0.8, actor: "edge", text: "miss", tone: "warn" },
      { kind: "fly", at: 0.9, dur: 1.0, from: "edge", to: "origin", label: "fetch" },
      { kind: "fly", at: 1.9, dur: 1.0, from: "origin", to: "edge", label: "page" },
      { kind: "say", at: 2.9, actor: "edge", text: "kept 60 s", tone: "good" },
      { kind: "fly", at: 2.9, dur: 0.5, from: "edge", to: "phone", label: "page" },
      { kind: "tag", at: 3.4, row: 0, value: 160, label: "miss: +160 ms", tone: "warn" },
      { kind: "say", at: 3.6, actor: "phone", text: "next shopper" },
      { kind: "fly", at: 3.8, dur: 0.5, from: "phone", to: "edge", label: "GET page" },
      { kind: "say", at: 4.3, actor: "edge", text: "hit", tone: "good" },
      { kind: "fly", at: 4.4, dur: 0.5, from: "edge", to: "phone", label: "page", tone: "good" },
      { kind: "tag", at: 4.9, row: 1, value: 0, label: "hit: +0 ms", tone: "good" },
      { kind: "verdict", at: 5.1, text: "A hit skips the 160 ms trip", tone: "good" },
    ],
    loop: 8.5,
  },
};
