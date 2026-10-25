import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.1 beat 1: A tap on a short link: Wasla answers with a redirect, the phone goes on.
export const sysdesignM20ClickALink: SceneSpec = {
  kind: "scene",
  title: "A tap on a short link adds one small hop",
  purpose: "The phone asks Wasla for /aB3x9Kp. Wasla finds the long address and answers with a redirect. The phone then opens the long page.",
  limits: "Wasla is a made-up service. Nothing here is timed: the point is the extra hop, which is the whole job of the service.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "taps the link", x: 70, y: 100 },
      { id: "wasla", label: "Wasla", kind: "server", sub: "short links", x: 350, y: 100 },
      { id: "site", label: "News site", kind: "server", sub: "long page", x: 350, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "phone", to: "wasla", label: "GET /aB3x9Kp" },
      { kind: "say", at: 1.2, actor: "wasla", text: "finds the URL", tone: "accent" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "wasla", to: "phone", label: "302 + long URL" },
      { kind: "say", at: 2.4, actor: "phone", text: "told to go on", tone: "warn" },
      { kind: "fly", at: 2.7, dur: 1.1, from: "phone", to: "site", label: "GET long URL" },
      { kind: "say", at: 3.8, actor: "site", text: "page opens", tone: "good" },
      { kind: "verdict", at: 4.0, text: "One short link, one extra hop", tone: "good" },
    ],
    loop: 7.5,
  },
};
