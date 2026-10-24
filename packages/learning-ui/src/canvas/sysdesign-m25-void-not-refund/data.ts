import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.4 beat 6: The seat is gone after the card was authorized. Void the authorization; nothing was charged.
export const sysdesignM25VoidNotRefund: SceneSpec = {
  kind: "scene",
  title: "The seat is gone: void, do not refund",
  purpose: "Tazkara authorizes 80 on Dina's card, which holds the money but does not take it. Then the seat confirm fails. Tazkara voids the authorization, the hold on the card is released, and her bank app shows no charge.",
  limits: "Amounts are course numbers. How long an authorization stays on a card, and how a bank app shows it, depend on the card network and the bank; the course does not give a number.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "Tazkara", kind: "server", sub: "checkout", x: 70, y: 100 },
      { id: "prov", label: "Provider", kind: "server", sub: "card side", x: 350, y: 100 },
      { id: "phone", label: "Dina's phone", kind: "phone", sub: "bank app", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "app", to: "prov", label: "authorize 80" },
      { kind: "say", at: 1.2, actor: "prov", text: "80 held on card", tone: "accent" },
      { kind: "say", at: 1.4, actor: "phone", text: "pending 80", tone: "warn" },
      { kind: "say", at: 2.3, actor: "app", text: "seat is gone", tone: "bad" },
      { kind: "fly", at: 2.9, dur: 0.8, from: "app", to: "prov", label: "void" },
      { kind: "say", at: 3.7, actor: "prov", text: "released", tone: "good" },
      { kind: "say", at: 3.9, actor: "phone", text: "no charge", tone: "good" },
      { kind: "verdict", at: 4.3, text: "Void: nothing was ever charged", tone: "good" },
    ],
    loop: 8,
  },
};
