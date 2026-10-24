import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.4 beat 4: the same loss with HTTP/3. QUIC delivers each stream on its
// own (stream-level reliability, RFC 9114 and RFC 9000), so b and c are
// usable at once and only a waits for its resend.
export const sysdesignM3H3Streams: SceneSpec = {
  kind: "scene",
  title: "HTTP/3: only the lost stream waits",
  purpose: "The same packet for stream a is lost, but QUIC hands b and c to the browser at once and only a waits for its resend.",
  limits: "80 ms per round trip (napkin-math estimate). The resend is drawn arriving one round trip later; real loss detection can take longer. Only one packet per stream is drawn.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "browser", kind: "phone", label: "Browser", sub: "QUIC streams", x: 60, y: 150 },
      { id: "net", kind: "router", label: "Network", sub: "busy Wi-Fi", x: 210, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "HTTP/3, QUIC", x: 360, y: 150 },
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
      { kind: "fly", at: 2.0, dur: 0.5, from: "net", to: "browser", label: "b", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.5, from: "net", to: "browser", label: "c", tone: "good" },
      { kind: "say", at: 2.7, actor: "browser", text: "b, c shown", tone: "good" },
      { kind: "tag", at: 2.7, row: 1, value: 80, label: "b, c usable 80 ms", tone: "good" },
      { kind: "say", at: 3.0, actor: "server", text: "resends a" },
      { kind: "fly", at: 3.0, dur: 0.5, from: "server", to: "net", label: "a again" },
      { kind: "fly", at: 3.5, dur: 0.5, from: "net", to: "browser", label: "a again" },
      { kind: "say", at: 4.0, actor: "browser", text: "a shown too" },
      { kind: "tag", at: 4.0, row: 0, value: 160, label: "a usable 160 ms", tone: "warn" },
      { kind: "verdict", at: 4.2, text: "Only a waits for its resend", tone: "good" },
    ],
    loop: 7,
  },
};
