import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.6 beat 4 (watch only): a home network and an office network each chose
// 192.168.1.0/24, independently, and each works fine alone. Then a VPN joins
// them, and both sides claim the same range. The laptop at home (192.168.1.23)
// reads 192.168.1.50 as part of its own /24 (the 3.2 test), so its request for
// the office file server stays on the home network. The scene does not model
// routing priority, packet loss or any VPN product. The networks and addresses
// are private and made up.
export const netM3SceneLateOverlap = {
  kind: "scene",
  title: "An overlap shows up late",
  purpose: "A home and an office each use 192.168.1.0/24 and work fine alone. When a VPN joins them, both claim the same range.",
  limits:
    "Two made-up networks with private addresses. The picture shows the conflict, not a fix. It does not model route priority, packet loss or any VPN product, and an overlap check names the conflict without replacing a look at the real routes.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "home", label: "Home", kind: "router", sub: "192.168.1.0/24", x: 70, y: 100 },
      { id: "office", label: "Office", kind: "router", sub: "192.168.1.0/24", x: 350, y: 100 },
      { id: "vpn", label: "VPN", kind: "cdn", sub: "not joined", x: 210, y: 190 },
      { id: "laptop", label: "Laptop", kind: "worker", sub: "192.168.1.23", x: 70, y: 280 },
      { id: "server", label: "File server", kind: "server", sub: "192.168.1.50", x: 350, y: 280 },
    ],
    events: [
      { kind: "fly", at: 0.5, dur: 1.8, from: "laptop", to: "home", label: "home use", tone: "good" },
      { kind: "fly", at: 0.5, dur: 1.8, from: "server", to: "office", label: "office use", tone: "good" },
      { kind: "say", at: 2.9, actor: "laptop", text: "works alone", tone: "good" },
      { kind: "say", at: 2.9, actor: "server", text: "works alone", tone: "good" },
      { kind: "say", at: 5, actor: "vpn", text: "joins both", tone: "accent" },
      { kind: "fly", at: 5, dur: 1.8, from: "home", to: "vpn", label: "tunnel", tone: "accent" },
      { kind: "fly", at: 5, dur: 1.8, from: "office", to: "vpn", label: "tunnel", tone: "accent" },
      { kind: "say", at: 7.4, actor: "home", text: "owns .1.0/24", tone: "bad" },
      { kind: "say", at: 7.4, actor: "office", text: "owns .1.0/24", tone: "bad" },
      { kind: "mark", at: 7.4, actor: "home", tone: "bad" },
      { kind: "mark", at: 7.4, actor: "office", tone: "bad" },
      { kind: "fly", at: 9, dur: 1.8, from: "laptop", to: "home", label: "to .50", tone: "warn" },
      { kind: "say", at: 11.2, actor: "home", text: "keeps it local", tone: "bad" },
      { kind: "say", at: 11.2, actor: "server", text: "never hears it", tone: "bad" },
      { kind: "verdict", at: 11.5, text: "Same range on both sides.", tone: "bad" },
    ],
    loop: 17.1,
  },
} satisfies SceneSpec;
