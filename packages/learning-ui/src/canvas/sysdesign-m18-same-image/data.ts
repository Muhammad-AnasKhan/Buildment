import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.1 beat 2 (Ship the kitchen, not the recipe).
export const sysdesignM18SameImage: SceneSpec = {
  kind: "scene",
  title: "One image runs the same way on every machine",
  purpose: "The team builds the code, Node and its libraries into one image once. The laptop, CI and the server all run that same image.",
  limits: "An image carries the program and its files, not the machine's kernel or hardware. A container still needs a compatible kernel and CPU type, and settings and secrets still come in from outside.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "laptop", label: "Laptop", kind: "server", x: 60, y: 95 },
      { id: "ci", label: "CI", kind: "worker", x: 210, y: 95 },
      { id: "prod", label: "Server", kind: "server", x: 360, y: 95 },
      { id: "image", label: "Image", kind: "note", sub: "code + Node 24", x: 210, y: 195 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "laptop", to: "image", label: "build once" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "image", to: "laptop", label: "run" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "image", to: "ci", label: "run" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "image", to: "prod", label: "run" },
      { kind: "say", at: 2.7, actor: "laptop", text: "works", tone: "good" },
      { kind: "say", at: 2.7, actor: "ci", text: "works", tone: "good" },
      { kind: "say", at: 2.7, actor: "prod", text: "works", tone: "good" },
      { kind: "verdict", at: 3.2, text: "Same image, same result", tone: "good" },
    ],
    loop: 6.2,
  },
};
