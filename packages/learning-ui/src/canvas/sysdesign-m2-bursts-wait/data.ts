import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.5 beat 2: three requests arrive together, then nothing for a while.
// The server works 3 s out of 6 (50% busy), yet two requests had to wait.
export const sysdesignM2BurstsWait: SceneSpec = {
  kind: "scene",
  title: "Half idle, and still a line forms",
  purpose: "Requests do not arrive evenly: three come at once, so two of them wait even though the server is idle half the time.",
  limits: "One burst of three requests, one second of work each, then quiet. Real arrivals are random: bursts and gaps of every size, which is what the M/M/1 model in the next picture assumes.",
  scene: {
    width: 420,
    height: 210,
    actors: [
      { id: "clients", kind: "user", label: "Clients", sub: "3 at once", x: 60, y: 120 },
      { id: "queue", kind: "queue", label: "Queue", sub: "empty", x: 210, y: 120 },
      { id: "server", kind: "server", label: "Server", sub: "idle", x: 360, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "fly", at: 0.4, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "fly", at: 0.5, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "say", at: 0.9, actor: "queue", text: "3 arrived" },
      { kind: "fly", at: 1.0, dur: 0.3, from: "queue", to: "server", label: "next" },
      { kind: "say", at: 1.3, actor: "server", text: "busy" },
      { kind: "say", at: 1.3, actor: "queue", text: "2 waiting", tone: "warn" },
      { kind: "fly", at: 2.0, dur: 0.3, from: "queue", to: "server", label: "next" },
      { kind: "say", at: 2.3, actor: "queue", text: "1 waiting", tone: "warn" },
      { kind: "fly", at: 3.0, dur: 0.3, from: "queue", to: "server", label: "next" },
      { kind: "say", at: 3.3, actor: "queue", text: "empty" },
      { kind: "say", at: 4.3, actor: "server", text: "idle half time", tone: "good" },
      { kind: "say", at: 4.3, actor: "clients", text: "2 had to wait", tone: "warn" },
      { kind: "verdict", at: 4.5, text: "Half idle, yet two had to wait", tone: "warn" },
    ],
    loop: 7.5,
  },
};
