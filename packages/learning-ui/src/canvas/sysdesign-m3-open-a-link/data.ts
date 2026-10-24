import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.1 beat 1: Lina taps a link to a shop whose server is in Singapore. Her
// phone is in EU West, about 160 ms away per round trip (napkin-math). The
// resolver already has the address. Then TCP (1 round trip), TLS 1.3
// (1 round trip) and the GET (1 round trip): the first byte arrives at 480 ms.
export const sysdesignM3OpenALink: SceneSpec = {
  kind: "scene",
  title: "One tap, four steps, three round trips",
  purpose: "Lina's phone finds the shop's address, opens a connection, secures it, and only then asks for the page.",
  limits: "EU West to Singapore is about 160 ms per round trip (napkin-math estimate). The resolver already has the address, so the DNS step is drawn but not timed. TCP with TLS 1.3 is shown; the server's own work and the page size are left out.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "phone", kind: "phone", label: "Phone", sub: "Lina, EU West", x: 60, y: 200 },
      { id: "resolver", kind: "server", label: "Resolver", sub: "near Lina", x: 210, y: 90 },
      { id: "shop", kind: "server", label: "Shop", sub: "in Singapore", x: 360, y: 200 },
    ],
    strip: { y: 320, from: 0, to: 480, unit: "ms", caption: "time after the address is known", every: 160 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "phone", to: "resolver", label: "shop address?" },
      { kind: "say", at: 0.8, actor: "resolver", text: "has it cached", tone: "good" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "resolver", to: "phone", label: "address" },
      { kind: "say", at: 1.5, actor: "phone", text: "connecting" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "phone", to: "shop", label: "SYN" },
      { kind: "fly", at: 2.3, dur: 0.7, from: "shop", to: "phone", label: "SYN-ACK" },
      { kind: "tag", at: 3.0, row: 0, value: 160, label: "TCP 160 ms" },
      { kind: "say", at: 3.0, actor: "phone", text: "securing" },
      { kind: "fly", at: 3.0, dur: 0.7, from: "phone", to: "shop", label: "TLS hello" },
      { kind: "fly", at: 3.7, dur: 0.7, from: "shop", to: "phone", label: "TLS keys" },
      { kind: "tag", at: 4.4, row: 1, value: 320, label: "TLS 320 ms" },
      { kind: "say", at: 4.4, actor: "phone", text: "asking" },
      { kind: "fly", at: 4.4, dur: 0.7, from: "phone", to: "shop", label: "GET /" },
      { kind: "say", at: 5.1, actor: "shop", text: "sends the page" },
      { kind: "fly", at: 5.1, dur: 0.7, from: "shop", to: "phone", label: "first byte", tone: "good" },
      { kind: "tag", at: 5.8, row: 0, value: 480, label: "first byte 480 ms", tone: "warn" },
      { kind: "say", at: 5.8, actor: "phone", text: "page starts", tone: "warn" },
      { kind: "verdict", at: 6.0, text: "3 round trips before one byte", tone: "warn" },
    ],
    loop: 9,
  },
};
