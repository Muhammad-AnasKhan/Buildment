import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.3 beat 1: Hashing the long URL gives the same code for the same URL.
export const sysdesignM20HashSameUrl: SceneSpec = {
  kind: "scene",
  title: "Hash the URL: the same URL always gets the same code",
  purpose: "Ana and Cy shorten the same long URL. Wasla hashes it, cuts the hash to 7 characters, and both get Qp7k2Mx. One row serves both of them.",
  limits: "The code Qp7k2Mx is made up. Real hashes of different URLs can also meet on one code; that rarer clash is the next beat.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "ana", label: "Ana", kind: "phone", sub: "shortens URL", x: 70, y: 100 },
      { id: "cy", label: "Cy", kind: "phone", sub: "same URL", x: 70, y: 235 },
      { id: "db", label: "Links table", kind: "database", sub: "no rows yet", x: 350, y: 168 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "ana", to: "db", label: "save Qp7k2Mx" },
      { kind: "say", at: 1.1, actor: "db", text: "1 row", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "db", to: "ana", label: "OK", tone: "good" },
      { kind: "say", at: 1.9, actor: "ana", text: "got Qp7k2Mx", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.9, from: "cy", to: "db", label: "save Qp7k2Mx" },
      { kind: "say", at: 3.1, actor: "db", text: "already there", tone: "warn" },
      { kind: "mark", at: 3.1, actor: "db", tone: "warn" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "db", to: "cy", label: "same code", tone: "warn" },
      { kind: "say", at: 3.9, actor: "cy", text: "got Qp7k2Mx", tone: "warn" },
      { kind: "verdict", at: 4.1, text: "Same URL gives one shared link", tone: "warn" },
    ],
    loop: 7.5,
  },
};
