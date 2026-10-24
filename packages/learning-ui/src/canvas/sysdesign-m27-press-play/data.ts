import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 27.1 beat 1: Pressing play asks for a page, then for many short pieces.
export const sysdesignM27PressPlay: SceneSpec = {
  kind: "scene",
  title: "Play is many small downloads",
  purpose: "A phone asks Lamha for the watch page, then downloads the video as short pieces, one after another, and plays each as it arrives. Nothing downloads the whole file first.",
  limits: "Lamha is made up. The picture shows one viewer and two pieces; a real player keeps a few pieces ready ahead of the one it plays. The pieces are 6 seconds long, a course choice.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "taps play", x: 70, y: 100 },
      { id: "svc", label: "Lamha", kind: "server", sub: "watch page", x: 350, y: 100 },
      { id: "cdn", label: "CDN edge", kind: "cdn", sub: "has the pieces", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "svc", label: "GET /watch/v81" },
      { kind: "say", at: 1.0, actor: "svc", text: "title + links", tone: "good" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "svc", to: "phone", label: "page + links" },
      { kind: "fly", at: 2.1, dur: 0.7, from: "phone", to: "cdn", label: "piece 1" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "cdn", to: "phone", label: "6 s of video" },
      { kind: "say", at: 3.5, actor: "phone", text: "playing", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.7, from: "phone", to: "cdn", label: "piece 2" },
      { kind: "fly", at: 4.3, dur: 0.7, from: "cdn", to: "phone", label: "6 s of video" },
      { kind: "verdict", at: 5.1, text: "Play is many small downloads", tone: "good" },
    ],
    loop: 8,
  },
};
