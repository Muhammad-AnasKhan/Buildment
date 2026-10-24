import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.3 beat 4: anycast. Two sites announce the same address; routing sends
// each user to one of them, usually the nearer. When one site stops
// announcing, routing moves its users to the other (RFC 4786).
export const sysdesignM3Anycast: SceneSpec = {
  kind: "scene",
  title: "One address, served from several places",
  purpose: "A user in Europe and a user in Asia send to the same address and reach different sites. When the Frankfurt site goes away, routing moves the European user to Singapore.",
  limits: "Routing chooses one site by the network's own rules; it is often, but not always, the nearest. A request already in flight when routes change can break, which is why anycast routes must stay stable for longer than a connection. 198.51.100.1 is an example address.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "eu", kind: "user", label: "Europe", sub: "to 198.51.100.1", x: 60, y: 100 },
      { id: "asia", kind: "user", label: "Asia", sub: "to 198.51.100.1", x: 60, y: 235 },
      { id: "fra", kind: "cdn", label: "Frankfurt", sub: "198.51.100.1", x: 360, y: 100 },
      { id: "sin", kind: "cdn", label: "Singapore", sub: "198.51.100.1", x: 360, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "eu", to: "fra", label: "GET" },
      { kind: "fly", at: 0.5, dur: 0.9, from: "asia", to: "sin", label: "GET" },
      { kind: "say", at: 1.2, actor: "fra", text: "answers Europe", tone: "good" },
      { kind: "say", at: 1.4, actor: "sin", text: "answers Asia", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "fra", to: "eu", label: "page", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "sin", to: "asia", label: "page", tone: "good" },
      { kind: "verdict", at: 2.5, text: "Same address, nearest site answers", tone: "good" },
      { kind: "say", at: 3.5, actor: "fra", text: "route withdrawn", tone: "bad" },
      { kind: "mark", at: 3.5, actor: "fra", tone: "bad" },
      { kind: "fly", at: 4.0, dur: 1.2, from: "eu", to: "sin", label: "GET" },
      { kind: "say", at: 5.2, actor: "sin", text: "answers both", tone: "warn" },
      { kind: "fly", at: 5.3, dur: 1.2, from: "sin", to: "eu", label: "page", tone: "warn" },
      { kind: "verdict", at: 6.5, text: "Site gone: routes move to the next", tone: "warn" },
    ],
    loop: 9.5,
  },
};
