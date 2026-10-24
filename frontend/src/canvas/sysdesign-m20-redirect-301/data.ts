import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.4 beat 3: A 301 redirect is kept by the browser, so the second tap never reaches Wasla.
export const sysdesignM20Redirect301: SceneSpec = {
  kind: "scene",
  title: "A 301 redirect: the second tap never reaches Wasla",
  purpose: "The phone taps the link and Wasla answers 301, which means moved for good. The phone keeps that answer, so a second tap goes straight to the news site. Wasla counts one click, not two.",
  limits: "Browsers decide how long to keep a 301, and often keep it for a long time. Wasla cannot change or switch off this link for a phone that already holds the 301.",
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
      { kind: "fly", at: 1.1, dur: 0.8, from: "wasla", to: "phone", label: "301 + URL" },
      { kind: "say", at: 1.9, actor: "phone", text: "keeps the 301", tone: "warn" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "phone", to: "site", label: "GET long URL" },
      { kind: "say", at: 2.9, actor: "site", text: "page opens", tone: "good" },
      { kind: "say", at: 3.6, actor: "phone", text: "taps again", tone: "accent" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "phone", to: "site", label: "straight there" },
      { kind: "say", at: 4.7, actor: "wasla", text: "never told", tone: "bad" },
      { kind: "mark", at: 4.7, actor: "wasla", tone: "bad" },
      { kind: "verdict", at: 4.9, text: "301: Wasla misses click 2", tone: "warn" },
    ],
    loop: 8,
  },
};
