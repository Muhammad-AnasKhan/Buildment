import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.2 beat 1: REST from a phone in Singapore to servers in EU West. The book
// names its seller, so the seller and reviews wait for the book: 2 round trips.
export const sysdesignM6RestRoundTrips: SceneSpec = {
  kind: "scene",
  title: "REST: three requests, two round trips",
  purpose: "The app needs the book before it knows the seller, so it pays one round trip for the book and a second for the seller and reviews together.",
  limits: "Each round trip is 160 ms, the napkin-math figure for EU West to Singapore. The picture leaves out the time the server spends working and the time to open the connection, and it slows everything down so you can follow it.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "in Singapore", x: 60, y: 120 },
      { id: "api", label: "Kitabi API", kind: "server", sub: "in EU West", x: 360, y: 120 },
    ],
    strip: { y: 268, from: 0, to: 400, unit: "ms", caption: "time the phone waits", every: 100 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "phone", to: "api", label: "GET /books/42" },
      { kind: "fly", at: 1.1, dur: 0.9, from: "api", to: "phone", label: "book: seller 7" },
      { kind: "tag", at: 2.0, row: 0, value: 160, label: "trip 1: 160 ms" },
      { kind: "say", at: 2.0, actor: "phone", text: "now ask seller" },
      { kind: "fly", at: 2.3, dur: 0.9, from: "phone", to: "api", label: "GET /sellers/7" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "phone", to: "api", label: "GET reviews" },
      { kind: "fly", at: 3.3, dur: 0.9, from: "api", to: "phone", label: "seller" },
      { kind: "fly", at: 3.6, dur: 0.9, from: "api", to: "phone", label: "reviews" },
      { kind: "tag", at: 4.5, row: 1, value: 320, label: "trip 2: 320 ms", tone: "warn" },
      { kind: "say", at: 4.5, actor: "phone", text: "page can draw", tone: "warn" },
      { kind: "verdict", at: 4.7, text: "3 requests, 2 round trips: 320 ms", tone: "warn" },
    ],
    loop: 7.6,
  },
};
