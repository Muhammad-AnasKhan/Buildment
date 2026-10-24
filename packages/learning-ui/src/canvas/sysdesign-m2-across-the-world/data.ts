import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.2 beat 4: round trips between regions. 60 ms is 1.9 human years,
// 80 ms is 2.5 years, 160 ms (EU West to Singapore) is 5.1 years.
export const sysdesignM2AcrossTheWorld: SceneSpec = {
  kind: "scene",
  title: "A round trip across the world takes years",
  purpose: "A server in Europe sends one request to Singapore and waits for the answer, with time stretched so 1 ns lasts 1 second.",
  limits: "napkin-math round trips: North America east to west 60 ms, EU West to North America East 80 ms, EU West to Singapore 160 ms. Light in fibre sets a floor, so faster servers cannot make these much shorter; only moving the data closer can.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "eu", kind: "server", label: "EU West", sub: "your server", x: 60, y: 200 },
      { id: "sg", kind: "database", label: "Singapore", sub: "the data", x: 360, y: 85 },
    ],
    strip: { y: 320, from: 0, to: 6, unit: "y", caption: "human time (1 ns becomes 1 s)", every: 1 },
    events: [
      { kind: "fly", at: 0.3, dur: 2.0, from: "eu", to: "sg", label: "request" },
      { kind: "wait", at: 0.3, dur: 4.1, actor: "eu", label: "waiting {n} years", doneLabel: "waited 5.1 years", total: 5.1 },
      { kind: "fly", at: 2.4, dur: 2.0, from: "sg", to: "eu", label: "reply" },
      { kind: "say", at: 4.4, actor: "eu", text: "160 ms real", tone: "warn" },
      { kind: "tag", at: 4.4, row: 0, value: 1.9, label: "NA east-west 1.9 y" },
      { kind: "tag", at: 4.6, row: 1, value: 2.5, label: "EU-NA east 2.5 y" },
      { kind: "tag", at: 4.8, row: 0, value: 5.1, label: "EU-Singapore 5.1 y", tone: "warn" },
      { kind: "verdict", at: 5.0, text: "Europe to Singapore: 5 years", tone: "warn" },
    ],
    loop: 8.6,
  },
};
