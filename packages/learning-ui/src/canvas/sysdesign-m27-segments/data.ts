import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.4 beat 1: A video is a playlist and a row of 6 second pieces.
export const sysdesignM27Segments: SceneSpec = {
  kind: "scene",
  title: "A video is a list of short pieces",
  purpose: "The player asks the CDN edge for a playlist that lists the qualities, picks one, then downloads piece after piece. Each piece is an ordinary file covering 6 seconds of video.",
  limits: "Lamha is made up and the 6 second piece length is a course choice. The picture shows three pieces and one quality; a real player keeps a few pieces ahead of the one it plays.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "phone", label: "Player", kind: "phone", sub: "wants a video", x: 70, y: 110 },
      { id: "cdn", label: "CDN edge", kind: "cdn", sub: "has the files", x: 350, y: 110 },
    ],
    strip: { y: 272, from: 0, to: 24, unit: "s", caption: "video time in seconds", every: 6 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "phone", to: "cdn", label: "playlist" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "cdn", to: "phone", label: "5 qualities" },
      { kind: "say", at: 1.6, actor: "phone", text: "picks 720p", tone: "accent" },
      { kind: "fly", at: 1.7, dur: 0.6, from: "phone", to: "cdn", label: "piece 1" },
      { kind: "fly", at: 2.3, dur: 0.6, from: "cdn", to: "phone", label: "6 s of video" },
      { kind: "tag", at: 2.9, row: 0, value: 3, label: "piece 1", tone: "good" },
      { kind: "say", at: 2.9, actor: "phone", text: "playing", tone: "good" },
      { kind: "fly", at: 3.0, dur: 0.6, from: "phone", to: "cdn", label: "piece 2" },
      { kind: "fly", at: 3.6, dur: 0.6, from: "cdn", to: "phone", label: "6 s of video" },
      { kind: "tag", at: 4.2, row: 0, value: 9, label: "piece 2", tone: "good" },
      { kind: "fly", at: 4.3, dur: 0.6, from: "phone", to: "cdn", label: "piece 3" },
      { kind: "fly", at: 4.9, dur: 0.6, from: "cdn", to: "phone", label: "6 s of video" },
      { kind: "tag", at: 5.5, row: 0, value: 15, label: "piece 3", tone: "good" },
      { kind: "verdict", at: 5.6, text: "A video is a list of 6 s pieces", tone: "good" },
    ],
    loop: 8.5,
  },
};
