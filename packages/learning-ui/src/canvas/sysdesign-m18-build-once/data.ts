import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.5 beat 4 (Build once, promote the same image).
export const sysdesignM18BuildOnce: SceneSpec = {
  kind: "scene",
  title: "The image that was tested is the image that ships",
  purpose: "CI builds the image once and pushes it to the registry with a fingerprint. Staging runs that image, and production runs the very same one.",
  limits: "The fingerprint (ab12cd here) stands for the image digest. Settings that differ between environments, such as a database address, come in from outside the image. If each environment rebuilt from source, each could contain different bytes.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "ci", label: "CI", kind: "worker", x: 60, y: 145 },
      { id: "reg", label: "Registry", kind: "database", sub: "image ab12cd", x: 210, y: 145 },
      { id: "stage", label: "Staging", kind: "server", x: 360, y: 95 },
      { id: "prod", label: "Prod", kind: "server", x: 360, y: 195 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "ci", to: "reg", label: "push ab12cd" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "reg", to: "stage", label: "ab12cd" },
      { kind: "say", at: 2.5, actor: "stage", text: "tests ab12cd", tone: "good" },
      { kind: "fly", at: 3.2, dur: 0.9, from: "reg", to: "prod", label: "ab12cd" },
      { kind: "say", at: 4.2, actor: "prod", text: "runs ab12cd", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Tested bytes are the shipped bytes", tone: "good" },
    ],
    loop: 7.5,
  },
};
