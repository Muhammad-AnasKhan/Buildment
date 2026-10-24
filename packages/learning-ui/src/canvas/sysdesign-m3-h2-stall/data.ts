import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.4 beat 3: head-of-line blocking in HTTP/2. The packet carrying stream a
// is lost. TCP delivers bytes strictly in order, so b and c, which arrived,
// are held until a's packet is sent again (RFC 9114: a lost packet stalls
// all active transactions).
export const sysdesignM3H2Stall: SceneSpec = {
  kind: "scene",
  title: "HTTP/2: one lost packet stalls every stream",
  purpose: "The network drops the packet that carries stream a. Streams b and c arrive, but TCP holds them back until a is resent.",
  limits: "80 ms per round trip (napkin-math estimate). The resend is drawn arriving one round trip later; real loss detection can take longer. Only one packet per stream is drawn.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "browser", kind: "phone", label: "Browser", sub: "one TCP conn", x: 60, y: 150 },
      { id: "net", kind: "router", label: "Network", sub: "busy Wi-Fi", x: 210, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "HTTP/2 on TCP", x: 360, y: 150 },
    ],
    strip: { y: 290, from: 0, to: 240, unit: "ms", caption: "ms after the requests were sent", every: 80 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "browser", to: "net", label: "GET a, b, c" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "net", to: "server", label: "GET a, b, c" },
      { kind: "say", at: 1.2, actor: "server", text: "sends a, b, c" },
      { kind: "fly", at: 1.3, dur: 0.5, from: "server", to: "net", label: "a" },
      { kind: "fly", at: 1.5, dur: 0.5, from: "server", to: "net", label: "b" },
      { kind: "fly", at: 1.7, dur: 0.5, from: "server", to: "net", label: "c" },
      { kind: "say", at: 1.8, actor: "net", text: "dropped a", tone: "bad" },
      { kind: "mark", at: 1.8, actor: "net", tone: "bad" },
      { kind: "fly", at: 2.0, dur: 0.5, from: "net", to: "browser", label: "b" },
      { kind: "fly", at: 2.2, dur: 0.5, from: "net", to: "browser", label: "c" },
      { kind: "say", at: 2.7, actor: "browser", text: "b, c held", tone: "warn" },
      { kind: "tag", at: 2.7, row: 1, value: 80, label: "b, c here 80 ms" },
      { kind: "say", at: 3.0, actor: "server", text: "resends a" },
      { kind: "fly", at: 3.0, dur: 0.5, from: "server", to: "net", label: "a again" },
      { kind: "fly", at: 3.5, dur: 0.5, from: "net", to: "browser", label: "a again" },
      { kind: "say", at: 4.0, actor: "browser", text: "a, b, c usable" },
      { kind: "tag", at: 4.0, row: 0, value: 160, label: "usable 160 ms", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "a is lost, so b and c wait too", tone: "bad" },
    ],
    loop: 7,
  },
};
