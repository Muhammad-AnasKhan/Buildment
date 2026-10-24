import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.2 beat 3: gRPC between two of Kitabi's own services. Both sides are
// generated from one .proto file; several calls share one HTTP/2 connection.
export const sysdesignM6GrpcCall: SceneSpec = {
  kind: "scene",
  title: "gRPC: typed calls between services",
  purpose: "Orders and payments share one contract file, and several Charge calls travel over one open connection at the same time.",
  limits: "Three calls stand for hundreds a second. The picture does not show the binary encoding, streaming or deadlines, and it slows the calls down so you can see them.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "orders", label: "Orders", kind: "server", sub: "service", x: 60, y: 110 },
      { id: "payments", label: "Payments", kind: "server", sub: "service", x: 360, y: 110 },
      { id: "proto", label: "Contract", kind: "note", sub: "payments.proto", x: 210, y: 220 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "orders", text: "code from proto" },
      { kind: "say", at: 0.4, actor: "payments", text: "code from proto" },
      { kind: "say", at: 0.8, actor: "orders", text: "1 connection" },
      { kind: "fly", at: 1.0, dur: 0.9, from: "orders", to: "payments", label: "Charge(1800)" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "orders", to: "payments", label: "Charge(950)" },
      { kind: "fly", at: 1.8, dur: 0.9, from: "orders", to: "payments", label: "Charge(400)" },
      { kind: "say", at: 2.3, actor: "payments", text: "types match", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.9, from: "payments", to: "orders", label: "ChargeReply" },
      { kind: "fly", at: 3.2, dur: 0.9, from: "payments", to: "orders", label: "ChargeReply" },
      { kind: "fly", at: 3.6, dur: 0.9, from: "payments", to: "orders", label: "ChargeReply" },
      { kind: "say", at: 4.5, actor: "orders", text: "3 calls, 1 conn", tone: "good" },
      { kind: "verdict", at: 4.7, text: "Small typed calls on one connection", tone: "good" },
    ],
    loop: 7.6,
  },
};
