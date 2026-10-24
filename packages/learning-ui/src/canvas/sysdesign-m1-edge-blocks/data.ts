import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 1 of 1.3: the edge. The phone asks DNS for Daftar's address (an
// address from the range kept for documentation), then fetches the logo
// from a CDN copy near the student instead of from Daftar's own server.
export const sysdesignM1EdgeBlocks: SceneSpec = {
  kind: "scene",
  title: "The edge: DNS finds the app, a CDN serves copies",
  purpose: "The phone gets Daftar's address from DNS, then gets the logo from a nearby CDN copy.",
  limits: "One DNS server stands for a chain of resolvers, and the address is from a range kept for examples. The CDN already has the logo; on a first request it would fetch it from Daftar's server and keep a copy.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "opens Daftar", x: 70, y: 165 },
      { id: "dns", label: "DNS", kind: "cdn", sub: "name to address", x: 300, y: 95 },
      { id: "cdn", label: "CDN", kind: "cdn", sub: "copies nearby", x: 300, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.8, from: "phone", to: "dns", label: "daftar.app?" },
      { kind: "say", at: 0.8, actor: "dns", text: "203.0.113.7", tone: "accent" },
      { kind: "fly", at: 0.9, dur: 0.8, from: "dns", to: "phone", label: "203.0.113.7", tone: "good" },
      { kind: "say", at: 1.7, actor: "phone", text: "has address", tone: "good" },

      { kind: "fly", at: 2.3, dur: 0.8, from: "phone", to: "cdn", label: "logo.png" },
      { kind: "say", at: 3.1, actor: "cdn", text: "cached copy", tone: "good" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "cdn", to: "phone", label: "logo.png", tone: "good" },
      { kind: "say", at: 4.0, actor: "phone", text: "logo loaded", tone: "good" },
      { kind: "verdict", at: 4.3, text: "Edge: find the app, serve nearby", tone: "accent" },
    ],
    loop: 7.3,
  },
};
