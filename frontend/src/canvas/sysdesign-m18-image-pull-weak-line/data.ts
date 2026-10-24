import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.3 beat 4 (Small images pull fast).
export const sysdesignM18ImagePullWeakLine: SceneSpec = {
  kind: "scene",
  title: "A small image downloads about six times faster",
  purpose: "On a weak 4 Mbit/s line, the full Node image (about 410 MB) takes about 14 minutes to pull. The alpine image (about 62 MB) takes about 2 minutes.",
  limits: "Packed download sizes from the Docker Hub API on 2026-10-24: node:24 409.9 MB, node:24-alpine 62.5 MB (amd64). The 4 Mbit/s line is a made-up example, and Docker only pulls layers you do not have yet.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "reg", label: "Registry", kind: "cdn", x: 360, y: 145 },
      { id: "full", label: "Full node", kind: "phone", sub: "410 MB", x: 60, y: 100 },
      { id: "slim", label: "Alpine", kind: "phone", sub: "62.5 MB", x: 60, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "reg", to: "full", label: "410 MB" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "reg", to: "slim", label: "62.5 MB" },
      { kind: "wait", at: 1.3, dur: 4, actor: "full", label: "pulling {n} min", doneLabel: "pulled: 13.7 min", total: 13.7 },
      { kind: "wait", at: 1.3, dur: 0.6, actor: "slim", label: "pulling {n} min", doneLabel: "pulled: 2.1 min", total: 2.1 },
      { kind: "verdict", at: 5.4, text: "Smaller image: six times faster", tone: "good" },
    ],
    loop: 8.2,
  },
};
