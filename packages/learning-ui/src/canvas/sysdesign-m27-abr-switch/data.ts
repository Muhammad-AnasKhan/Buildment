import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.4 beat 2: The player sees a slow piece and asks for a lower quality.
export const sysdesignM27AbrSwitch: SceneSpec = {
  kind: "scene",
  title: "The player steps down, the video does not stop",
  purpose: "The network slows in a tunnel. Piece 3 arrives slowly, so the player asks for piece 4 in a lower quality. The servers never notice; the picture gets softer and the video keeps playing.",
  limits: "One viewer and four pieces. The switch rule is an example: real players weigh their buffer, recent speed and the next quality, and use different thresholds. Quality can only change at the start of a piece.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "phone", label: "Player", kind: "phone", sub: "720p", x: 70, y: 110 },
      { id: "cdn", label: "CDN edge", kind: "cdn", sub: "all qualities", x: 350, y: 110 },
    ],
    strip: { y: 272, from: 0, to: 24, unit: "s", caption: "video time in seconds", every: 6 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "phone", to: "cdn", label: "piece 1" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "cdn", to: "phone", label: "720p" },
      { kind: "tag", at: 1.2, row: 0, value: 3, label: "S1 720p", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.5, from: "phone", to: "cdn", label: "piece 2" },
      { kind: "fly", at: 1.8, dur: 0.5, from: "cdn", to: "phone", label: "720p" },
      { kind: "tag", at: 2.3, row: 0, value: 9, label: "S2 720p", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.5, from: "phone", to: "cdn", label: "piece 3" },
      { kind: "say", at: 2.9, actor: "phone", text: "slow network", tone: "warn" },
      { kind: "mark", at: 2.9, actor: "phone", tone: "warn" },
      { kind: "fly", at: 2.9, dur: 1.4, from: "cdn", to: "phone", label: "720p, slow" },
      { kind: "tag", at: 4.3, row: 0, value: 15, label: "S3 720p", tone: "warn" },
      { kind: "say", at: 4.3, actor: "phone", text: "switch to 360p", tone: "accent" },
      { kind: "fly", at: 4.4, dur: 0.6, from: "phone", to: "cdn", label: "4 at 360p" },
      { kind: "fly", at: 5.0, dur: 0.5, from: "cdn", to: "phone", label: "360p" },
      { kind: "tag", at: 5.5, row: 0, value: 21, label: "S4 360p", tone: "good" },
      { kind: "say", at: 5.5, actor: "phone", text: "no stall", tone: "good" },
      { kind: "verdict", at: 5.7, text: "Player steps down, no stall", tone: "good" },
    ],
    loop: 8.5,
  },
};
