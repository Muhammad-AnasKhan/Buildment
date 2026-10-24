import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.3 beat 2: Sara asks the same resolver 60 s after Lina did. The answer is
// still inside its 300 s TTL, so the resolver answers from its cache and
// passes on the time left (240 s). The name server is not asked at all.
export const sysdesignM3DnsCache: SceneSpec = {
  kind: "scene",
  title: "A cached answer needs no walk",
  purpose: "A second phone asks for the same name within the TTL, and the resolver answers from memory.",
  limits: "The 300 s TTL is an example. A record may be cached for its TTL, and a TTL of 0 means it must not be cached at all (RFC 1035). Only one resolver is drawn.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "phone", kind: "phone", label: "Phone", sub: "Sara asks", x: 60, y: 150 },
      { id: "resolver", kind: "server", label: "Resolver", sub: "cached at 0 s", x: 210, y: 150 },
      { id: "ns", kind: "server", label: "Name server", sub: "not asked", x: 360, y: 150 },
    ],
    strip: { y: 300, from: 0, to: 300, unit: "s", caption: "seconds since the answer was cached", every: 60 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 0, label: "cached 0 s" },
      { kind: "tag", at: 0.2, row: 0, value: 300, label: "expires 300 s", tone: "warn" },
      { kind: "tag", at: 0.6, row: 1, value: 60, label: "Sara asks 60 s" },
      { kind: "fly", at: 0.6, dur: 0.7, from: "phone", to: "resolver", label: "shop?" },
      { kind: "say", at: 1.3, actor: "resolver", text: "cache hit", tone: "good" },
      { kind: "mark", at: 1.3, actor: "resolver", tone: "good" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "resolver", to: "phone", label: "address, 240 s", tone: "good" },
      { kind: "say", at: 2.1, actor: "phone", text: "has address", tone: "good" },
      { kind: "verdict", at: 2.3, text: "From the cache: no walk, no wait", tone: "good" },
    ],
    loop: 5.5,
  },
};
