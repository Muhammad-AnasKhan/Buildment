import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.5 beat 4 ("The token stayed on her phone"). A session token kept on one device does not protect the same user on a second device.
export const sysdesignM11TwoDevices: SceneSpec = {
  kind: "scene",
  title: "The token stayed on her phone",
  purpose: "Amna posts from her phone, which now holds token 1. She opens the forum on her laptop. The laptop has no token, so the router may use a replica that is behind.",
  limits: "One replica and one post. The fix is to keep the user's latest position on the server, keyed by user, so any device can use it.",
  scene: {
    width: 420,
    height: 400,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "posts", x: 70, y: 100 },
      { id: "laptop", label: "Laptop", kind: "user", sub: "no token", x: 350, y: 100 },
      { id: "router", label: "Router", kind: "router", sub: "uses a token", x: 210, y: 215 },
      { id: "leader", label: "Leader", kind: "database", sub: "position 0", x: 70, y: 330 },
      { id: "replica", label: "Replica", kind: "database", sub: "position 0", x: 350, y: 330 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "phone", to: "router", label: "post" },
      { kind: "fly", at: 1, dur: 0.7, from: "router", to: "leader", label: "write" },
      { kind: "say", at: 1.7, actor: "leader", text: "position 1", tone: "good" },
      { kind: "fly", at: 1.8, dur: 1.4, from: "leader", to: "replica", label: "copy (slow)", tone: "warn" },
      { kind: "fly", at: 1.8, dur: 1.4, from: "router", to: "phone", label: "token 1", tone: "good" },
      { kind: "say", at: 3.2, actor: "phone", text: "token: 1", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.7, from: "laptop", to: "router", label: "read" },
      { kind: "say", at: 4.3, actor: "router", text: "no token: any", tone: "warn" },
      { kind: "fly", at: 4.4, dur: 0.7, from: "router", to: "replica", label: "read" },
      { kind: "fly", at: 5.1, dur: 1.2, from: "replica", to: "laptop", label: "no comment", tone: "bad" },
      { kind: "say", at: 6.3, actor: "laptop", text: "sees nothing", tone: "bad" },
      { kind: "say", at: 6.4, actor: "replica", text: "position 1", tone: "good" },
      { kind: "verdict", at: 6.4, text: "The token stayed on her phone", tone: "bad" },
    ],
    loop: 9.4,
  },
};
