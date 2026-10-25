import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.7 beat 6: service identity. Orders proves who it is with a certificate;
// an unknown caller on the same private network has none and is refused.
export const sysdesignM6ServiceIdentity: SceneSpec = {
  kind: "scene",
  title: "Services prove who they are too",
  purpose: "Payments accepts a call from the orders service, which shows its certificate, and refuses an unknown caller on the same network.",
  limits: "A certificate (mutual TLS) is drawn; a short-lived service token works the same way. The picture leaves out how certificates are issued and renewed.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "orders", label: "Orders", kind: "server", sub: "has a cert", x: 60, y: 110 },
      { id: "payments", label: "Payments", kind: "server", sub: "checks certs", x: 360, y: 110 },
      { id: "unknown", label: "Unknown", kind: "worker", sub: "no cert", x: 60, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "orders", to: "payments", label: "Charge + cert" },
      { kind: "say", at: 1.0, actor: "payments", text: "cert: orders OK", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "payments", to: "orders", label: "OK", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.8, from: "unknown", to: "payments", label: "Charge" },
      { kind: "say", at: 3.0, actor: "payments", text: "no cert: refuse", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "payments", to: "unknown", label: "refused", tone: "bad" },
      { kind: "say", at: 4.0, actor: "unknown", text: "refused", tone: "bad" },
      { kind: "mark", at: 4.0, actor: "unknown", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "Unknown caller refused, even inside", tone: "good" },
    ],
    loop: 7.2,
  },
};
