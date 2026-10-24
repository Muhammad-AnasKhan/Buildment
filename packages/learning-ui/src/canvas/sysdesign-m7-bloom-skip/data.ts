import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.3 beat 6. A Bloom filter cuts the files a point read must open, at the cost of a little memory per key.
export const sysdesignM7BloomSkip: SceneSpec = {
  kind: "scene",
  title: "A Bloom filter lets a read skip files",
  purpose: "Each file has a Bloom filter. A 'no' means the key is surely not in that file, so the read skips it. Only the 'maybe' file is read.",
  limits: "A Bloom filter can wrongly say maybe (a false positive) but never wrongly says no. With about 10 bits per key the wrong 'maybe' rate is about 1%. It answers 'is this exact key here?' and does not help range scans.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "Reader", kind: "server", sub: "get ticket 9", x: 210, y: 100 },
      { id: "f1", label: "File 3 (new)", kind: "database", sub: "has a filter", x: 62, y: 255 },
      { id: "f2", label: "File 2", kind: "database", sub: "has a filter", x: 210, y: 255 },
      { id: "f3", label: "File 1 (old)", kind: "database", sub: "has a filter", x: 358, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "f1", label: "ask filter" },
      { kind: "say", at: 1, actor: "f1", text: "no: skip", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.6, from: "app", to: "f2", label: "ask filter" },
      { kind: "say", at: 2, actor: "f2", text: "no: skip", tone: "good" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "app", to: "f3", label: "ask filter" },
      { kind: "say", at: 3, actor: "f3", text: "maybe", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 0.6, from: "app", to: "f3", label: "read file" },
      { kind: "fly", at: 4, dur: 0.7, from: "f3", to: "app", label: "ticket 9", tone: "good" },
      { kind: "say", at: 4.7, actor: "app", text: "found it", tone: "good" },
      { kind: "verdict", at: 4.9, text: "Opened 1 file instead of 3", tone: "good" },
    ],
    loop: 7.7,
  },
};
