import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.3 beat 1: a resolver with an empty cache answers the phone recursively,
// and walks the name servers iteratively: each one refers it to the next,
// until the name server for example.com gives the address (RFC 1034).
export const sysdesignM3DnsLookup: SceneSpec = {
  kind: "scene",
  title: "The resolver walks the name tree for you",
  purpose: "The phone asks one question. The resolver asks three name servers in turn, each pointing it closer, then keeps the answer.",
  limits: "The resolver's cache starts empty, which is the slowest case. The 300 s TTL is an example value set by the domain's owner. 203.0.113.7 is an example address.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", kind: "phone", label: "Phone", sub: "wants address", x: 60, y: 165 },
      { id: "resolver", kind: "server", label: "Resolver", sub: "cache empty", x: 210, y: 165 },
      { id: "root", kind: "server", label: "Root", sub: "top of tree", x: 360, y: 85 },
      { id: "tld", kind: "server", label: ".com", sub: "knows .com", x: 360, y: 165 },
      { id: "ns", kind: "server", label: "Name server", sub: "of example.com", x: 360, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "phone", to: "resolver", label: "shop.example.com?" },
      { kind: "say", at: 0.8, actor: "resolver", text: "will find it" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "resolver", to: "root", label: "where?" },
      { kind: "say", at: 1.4, actor: "root", text: "ask .com" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "root", to: "resolver", label: "try .com" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "resolver", to: "tld", label: "where?" },
      { kind: "say", at: 2.6, actor: "tld", text: "ask its server" },
      { kind: "fly", at: 2.6, dur: 0.6, from: "tld", to: "resolver", label: "try its server" },
      { kind: "fly", at: 3.2, dur: 0.6, from: "resolver", to: "ns", label: "where?" },
      { kind: "say", at: 3.8, actor: "ns", text: "203.0.113.7", tone: "good" },
      { kind: "fly", at: 3.8, dur: 0.6, from: "ns", to: "resolver", label: "203.0.113.7" },
      { kind: "say", at: 4.4, actor: "resolver", text: "cached 300 s", tone: "good" },
      { kind: "fly", at: 4.4, dur: 0.6, from: "resolver", to: "phone", label: "203.0.113.7", tone: "good" },
      { kind: "say", at: 5.0, actor: "phone", text: "has address", tone: "good" },
      { kind: "verdict", at: 5.1, text: "Resolver walked the tree for you", tone: "good" },
    ],
    loop: 8,
  },
};
