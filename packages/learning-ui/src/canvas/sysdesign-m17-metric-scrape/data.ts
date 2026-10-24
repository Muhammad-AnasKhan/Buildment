import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.2 beat 3 (A metric is a number over time).
export const sysdesignM17MetricScrape: SceneSpec = {
  kind: "scene",
  title: "A counter grows, and the metrics store reads it every 15 seconds",
  purpose: "The api keeps one running count of requests. Every 15 seconds the metrics store asks for it and saves the number with the time. Three saved points make a line, but no point names a single request.",
  limits: "One counter and a 15 second pull. The counts 1,200, 1,500 and 1,830 are course numbers. Real systems keep many counters and often add labels such as the service or the status code.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "api", label: "Api", kind: "server", sub: "1,200 requests", x: 60, y: 100 },
      { id: "store", label: "Metrics", kind: "database", sub: "0 points", x: 360, y: 100 },
    ],
    strip: { y: 290, from: 0, to: 60, unit: "s", caption: "time of each pull", every: 15 },
    events: [
      { kind: "fly", at: 0.4, dur: 1.2, from: "store", to: "api", label: "pull" },
      { kind: "fly", at: 1.7, dur: 1.2, from: "api", to: "store", label: "1,200" },
      { kind: "tag", at: 2.9, row: 0, value: 15, label: "1,200", tone: "accent" },
      { kind: "say", at: 2.9, actor: "store", text: "1 point", tone: "accent" },
      { kind: "say", at: 3.3, actor: "api", text: "1,500 requests" },
      { kind: "fly", at: 3.6, dur: 1.2, from: "store", to: "api", label: "pull" },
      { kind: "fly", at: 4.9, dur: 1.2, from: "api", to: "store", label: "1,500" },
      { kind: "tag", at: 6.1, row: 0, value: 30, label: "1,500", tone: "accent" },
      { kind: "say", at: 6.1, actor: "store", text: "2 points", tone: "accent" },
      { kind: "say", at: 6.5, actor: "api", text: "1,830 requests" },
      { kind: "fly", at: 6.8, dur: 1.2, from: "store", to: "api", label: "pull" },
      { kind: "fly", at: 8.1, dur: 1.2, from: "api", to: "store", label: "1,830", tone: "accent" },
      { kind: "tag", at: 9.3, row: 0, value: 45, label: "1,830", tone: "accent" },
      { kind: "say", at: 9.3, actor: "store", text: "3 points", tone: "good" },
      { kind: "verdict", at: 9.9, text: "A number per pull; no request named", tone: "warn" },
    ],
    loop: 13,
  },
};
