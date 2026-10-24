import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.4 beat 4: A 302 redirect is not kept by default, so every tap reaches Wasla.
export const sysdesignM20Redirect302: SceneSpec = {
  kind: "scene",
  title: "A 302 redirect: every tap reaches Wasla",
  purpose: "Wasla answers 302, which means found, for now. The phone does not keep it by default, so the second tap asks Wasla again. Wasla counts two clicks and could have changed or stopped the link in between.",
  limits: "The price is that all of the clicks arrive at Wasla, at peak about 100,000 a second in the chapter's estimate. That load is why the cache is in the design.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "taps the link", x: 70, y: 100 },
      { id: "wasla", label: "Wasla", kind: "server", sub: "clicks: 0", x: 350, y: 100 },
      { id: "site", label: "News site", kind: "server", sub: "long page", x: 350, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "wasla", label: "GET /aB3x9Kp" },
      { kind: "say", at: 1.0, actor: "wasla", text: "clicks: 1", tone: "accent" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "wasla", to: "phone", label: "302 + URL" },
      { kind: "say", at: 1.9, actor: "phone", text: "follows once", tone: "accent" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "phone", to: "site", label: "GET long URL" },
      { kind: "say", at: 2.9, actor: "site", text: "page opens", tone: "good" },
      { kind: "say", at: 3.6, actor: "phone", text: "taps again", tone: "accent" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "phone", to: "wasla", label: "GET /aB3x9Kp" },
      { kind: "say", at: 4.7, actor: "wasla", text: "clicks: 2", tone: "good" },
      { kind: "mark", at: 4.7, actor: "wasla", tone: "good" },
      { kind: "verdict", at: 4.9, text: "302: every click reaches Wasla", tone: "good" },
    ],
    loop: 8,
  },
};
