import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.5 beat 1 (Dark until the cache expires). Health check 30 s x 3 failures = 90 s, then a 60 s cached answer = 150 s.
export const sysdesignM19DnsTimeline: SceneSpec = {
  kind: "scene",
  title: "DNS failover takes the check time plus the TTL",
  purpose: "Region A fails at second 0. Three failed checks, 30 seconds apart, change the DNS answer at second 90. A user whose phone cached the old answer keeps using it until second 150.",
  limits: "A check every 30 seconds with three failures, and a TTL of 60 seconds. The three-failure rule and the worst-case cache are course choices. Long-lived connections and resolvers that keep answers too long can make it worse.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "users", label: "Customer", kind: "phone", sub: "cached: A", x: 62, y: 105 },
      { id: "dns", label: "DNS", kind: "router", sub: "answer: A", x: 210, y: 105 },
      { id: "a", label: "Region A", kind: "server", sub: "up", x: 358, y: 105 },
      { id: "b", label: "Region B", kind: "server", sub: "standby", x: 210, y: 195 },
    ],
    strip: { y: 296, from: 0, to: 240, unit: "s", caption: "seconds after Region A fails", every: 30 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 0, label: "A fails", tone: "bad" },
      { kind: "say", at: 0.3, actor: "a", text: "down", tone: "bad" },
      { kind: "mark", at: 0.3, actor: "a", tone: "bad" },
      { kind: "fly", at: 0.8, dur: 0.8, from: "users", to: "a", label: "order" },
      { kind: "say", at: 1.7, actor: "users", text: "no answer", tone: "bad" },
      { kind: "tag", at: 2.3, row: 1, value: 90, label: "3rd check fails", tone: "warn" },
      { kind: "say", at: 2.4, actor: "dns", text: "answer: B", tone: "good" },
      { kind: "fly", at: 3, dur: 0.8, from: "users", to: "a", label: "order" },
      { kind: "say", at: 3.9, actor: "users", text: "still dark", tone: "bad" },
      { kind: "tag", at: 4.3, row: 0, value: 150, label: "Cache expires", tone: "good" },
      { kind: "say", at: 4.4, actor: "users", text: "cached: B", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.9, from: "users", to: "b", label: "order" },
      { kind: "say", at: 5.8, actor: "b", text: "serving", tone: "good" },
      { kind: "verdict", at: 5.9, text: "Dark for 90 s check + 60 s cache", tone: "warn" },
    ],
    loop: 9,
  },
};
