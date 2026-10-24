import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.2 beat 4 (Look up a host once, not every time).
export const sysdesignM26DnsCache: SceneSpec = {
  kind: "scene",
  title: "A DNS cache turns 100 ms into 0.5 ms",
  purpose: "Every fetch needs the host's IP address. The first lookup goes out to a DNS server and takes a long time. The crawler keeps the answer in its own cache, so the next page on that host is fast.",
  limits: "Course numbers: a cold lookup of about 100 ms (a few round trips to name servers) and a cache query of about 0.5 ms. Real answers carry a TTL, and the cache must honour it or cap it.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "fetcher", label: "Fetcher", kind: "worker", sub: "needs an IP", x: 70, y: 100 },
      { id: "cache", label: "DNS cache", kind: "cache", sub: "empty", x: 350, y: 100 },
      { id: "dns", label: "DNS server", kind: "router", sub: "outside", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "fetcher", to: "cache", label: "host IP?" },
      { kind: "say", at: 1, actor: "cache", text: "miss", tone: "bad" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "cache", to: "dns", label: "ask DNS" },
      { kind: "say", at: 1.9, actor: "dns", text: "100 ms", tone: "warn" },
      { kind: "fly", at: 2.1, dur: 0.8, from: "dns", to: "cache", label: "the IP" },
      { kind: "say", at: 2.9, actor: "cache", text: "kept 5 min", tone: "good" },
      { kind: "fly", at: 3, dur: 0.8, from: "cache", to: "fetcher", label: "IP, 100 ms" },
      { kind: "say", at: 3.8, actor: "fetcher", text: "fetches page 1", tone: "accent" },
      { kind: "fly", at: 4.6, dur: 0.8, from: "fetcher", to: "cache", label: "host IP?" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "cache", to: "fetcher", label: "IP, 0.5 ms", tone: "good" },
      { kind: "say", at: 6.2, actor: "fetcher", text: "no wait", tone: "good" },
      { kind: "verdict", at: 6.4, text: "Next page: 0.5 ms, not 100 ms", tone: "good" },
    ],
    loop: 9.5,
  },
};
