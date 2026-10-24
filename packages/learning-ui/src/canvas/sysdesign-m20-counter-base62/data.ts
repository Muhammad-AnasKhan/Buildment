import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 20.3 beat 3: A counter plus base62 gives codes that never clash, but follow one another.
export const sysdesignM20CounterBase62: SceneSpec = {
  kind: "scene",
  title: "A counter never repeats, but the codes follow each other",
  purpose: "An app server asks the counter for the next number, 125, and writes it in base62 as 0000021. The next link gets 126, which is 0000022.",
  limits: "One app and one counter. The counter is a single point of failure, and with many apps every code costs a trip to it; the next beat removes most of those trips.",
  scene: {
    width: 420,
    height: 240,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "needs a code", x: 70, y: 110 },
      { id: "counter", label: "Counter", kind: "database", sub: "now: 125", x: 350, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "app", to: "counter", label: "next number" },
      { kind: "say", at: 1.2, actor: "counter", text: "gave 125", tone: "accent" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "counter", to: "app", label: "125" },
      { kind: "say", at: 2.2, actor: "app", text: "0000021", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.9, from: "app", to: "counter", label: "next number" },
      { kind: "say", at: 3.7, actor: "counter", text: "gave 126", tone: "accent" },
      { kind: "fly", at: 3.8, dur: 0.9, from: "counter", to: "app", label: "126" },
      { kind: "say", at: 4.7, actor: "app", text: "0000022", tone: "warn" },
      { kind: "verdict", at: 4.9, text: "Unique, but easy to guess", tone: "warn" },
    ],
    loop: 8,
  },
};
