import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.5 beat 1 (watch only): a voice call sends one small audio packet every
// 20 ms. Packets 1 to 3 arrive and play. Packet 4 is held up and arrives about
// half a second late (560 ms, when it was due at 100 ms). By then the call has
// moved on, so the friend skips it and plays packet 5. The numbers (20 ms, due
// at 100 ms, arrives at 560 ms) are model numbers for the picture, not
// measurements. The strip is a model time axis in milliseconds; its tags are
// kept on two rows so they never touch.
export const netM5SceneLateAudio = {
  kind: "scene",
  title: "A late voice packet is skipped",
  purpose: "A call sends one audio packet every 20 ms. One packet arrives about half a second late, so the friend skips it and plays the next.",
  limits:
    "Model numbers, not measurements: a packet every 20 ms, one packet due at 100 ms that arrives at 560 ms. Real call apps are more careful than this picture and keep a short buffer. The scene shows the idea that a packet that comes too late has no use, not how a real app decides.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "caller", label: "You", kind: "phone", sub: "20 ms packets", x: 70, y: 120 },
      { id: "friend", label: "Friend", kind: "phone", sub: "listening", x: 350, y: 120 },
    ],
    strip: { y: 290, from: 0, to: 600, unit: "ms", caption: "milliseconds after packet 4 is sent", every: 100 },
    events: [
      { kind: "say", at: 0.4, actor: "caller", text: "talking", tone: "accent" },
      { kind: "fly", at: 0.7, dur: 1.1, from: "caller", to: "friend", label: "1" },
      { kind: "fly", at: 1.4, dur: 1.1, from: "caller", to: "friend", label: "2" },
      { kind: "fly", at: 2.2, dur: 1.1, from: "caller", to: "friend", label: "3" },
      { kind: "say", at: 3.4, actor: "friend", text: "plays 1 2 3", tone: "good" },
      { kind: "fly", at: 3.8, dur: 5.8, from: "caller", to: "friend", label: "4", tone: "warn" },
      { kind: "tag", at: 3.8, row: 0, value: 100, label: "due at 100 ms", tone: "good" },
      { kind: "fly", at: 4.5, dur: 1.1, from: "caller", to: "friend", label: "5" },
      { kind: "say", at: 5.9, actor: "friend", text: "plays 5", tone: "good" },
      { kind: "tag", at: 9.5, row: 1, value: 560, label: "arrives at 560 ms", tone: "bad" },
      { kind: "say", at: 9.5, actor: "friend", text: "skips 4", tone: "bad" },
      { kind: "verdict", at: 9.7, text: "Too late to use, so it is skipped.", tone: "bad" },
    ],
    loop: 14.4,
  },
} satisfies SceneSpec;
