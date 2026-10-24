import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.4 beat 1: HTTP/1.1 on one open connection. The browser needs three
// files; each request waits for the answer to the one before it, so three
// files cost three round trips (240 ms at 80 ms each).
export const sysdesignM3Http1OneAtATime: SceneSpec = {
  kind: "scene",
  title: "HTTP/1.1: one request at a time per connection",
  purpose: "On one HTTP/1.1 connection, the browser sends the next request only after the answer to the last one is back.",
  limits: "One open connection, 80 ms per round trip (napkin-math estimate), and tiny files. Browsers open several HTTP/1.1 connections to the same server to get some parallelism; each one still carries one request at a time.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "browser", kind: "phone", label: "Browser", sub: "needs 3 files", x: 60, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "HTTP/1.1", x: 360, y: 150 },
    ],
    strip: { y: 290, from: 0, to: 240, unit: "ms", caption: "ms on one open connection", every: 80 },
    events: [
      { kind: "say", at: 0.2, actor: "browser", text: "2 waiting" },
      { kind: "fly", at: 0.2, dur: 0.6, from: "browser", to: "server", label: "GET a.css" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "server", to: "browser", label: "a.css" },
      { kind: "tag", at: 1.4, row: 0, value: 80, label: "a.css 80 ms" },
      { kind: "say", at: 1.4, actor: "browser", text: "1 waiting" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "browser", to: "server", label: "GET b.js" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "server", to: "browser", label: "b.js" },
      { kind: "tag", at: 2.6, row: 1, value: 160, label: "b.js 160 ms" },
      { kind: "say", at: 2.6, actor: "browser", text: "0 waiting" },
      { kind: "fly", at: 2.6, dur: 0.6, from: "browser", to: "server", label: "GET c.png" },
      { kind: "fly", at: 3.2, dur: 0.6, from: "server", to: "browser", label: "c.png" },
      { kind: "tag", at: 3.8, row: 0, value: 240, label: "c.png 240 ms", tone: "warn" },
      { kind: "say", at: 3.8, actor: "browser", text: "all 3 loaded" },
      { kind: "verdict", at: 4.0, text: "One at a time on this connection", tone: "warn" },
    ],
    loop: 7,
  },
};
