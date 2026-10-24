import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.4 beat 6: A rarely watched video misses at the edge and pays the trip to far storage.
export const sysdesignM27LongTail: SceneSpec = {
  kind: "scene",
  title: "A rarely watched video pays the full trip",
  purpose: "Nobody has watched this old lesson for months, so the Singapore edge has no copy. It asks storage in EU West, waits for the read, and only then sends the piece. A round trip of about 160 ms plus a read of about 80 ms adds about 240 ms to that one piece.",
  limits: "Round trip of about 160 ms between EU West and Singapore, and a blob read of about 80 ms, are from napkin-math, which warns that some numbers are 2 to 3 times off. A real path may add an origin shield hop. The delay is paid for each piece that misses; the player's buffer hides it after the start.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "viewer", label: "Omar", kind: "phone", sub: "Singapore", x: 70, y: 100 },
      { id: "edge", label: "CDN edge", kind: "cdn", sub: "no copy", x: 350, y: 100 },
      { id: "store", label: "Storage", kind: "database", sub: "EU West", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "viewer", to: "edge", label: "piece 1" },
      { kind: "say", at: 1.0, actor: "edge", text: "miss", tone: "bad" },
      { kind: "fly", at: 1.1, dur: 1.2, from: "edge", to: "store", label: "asks EU West" },
      { kind: "say", at: 2.3, actor: "store", text: "reads 80 ms", tone: "warn" },
      { kind: "fly", at: 2.5, dur: 1.2, from: "store", to: "edge", label: "piece 1" },
      { kind: "say", at: 3.7, actor: "edge", text: "+240 ms", tone: "warn" },
      { kind: "fly", at: 3.8, dur: 0.8, from: "edge", to: "viewer", label: "piece 1" },
      { kind: "say", at: 4.6, actor: "viewer", text: "starts late", tone: "warn" },
      { kind: "verdict", at: 4.8, text: "Long tail pays the full trip", tone: "warn" },
    ],
    loop: 8,
  },
};
