import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.2 beat 1: scale time so 1 ns becomes 1 second. An L1 cache hit (about
// 1 ns) takes 1 human second; a main memory reference (100 ns) takes 100.
export const sysdesignM2CacheVsMemory: SceneSpec = {
  kind: "scene",
  title: "A cache hit takes a second, memory takes minutes",
  purpose: "The CPU reads one value from its L1 cache and one from main memory, with time stretched so 1 ns lasts 1 second.",
  limits: "Times are modelled values from Colin Scott's latency page (L1 about 1 ns, memory 100 ns), not measurements of your machine. Real CPUs hide some memory time by fetching ahead and doing other work while they wait.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "cpu", kind: "server", label: "CPU core", sub: "needs a and b", x: 60, y: 200 },
      { id: "l1", kind: "cache", label: "L1 cache", sub: "has a", x: 190, y: 85 },
      { id: "mem", kind: "database", label: "Memory", sub: "has b", x: 360, y: 85 },
    ],
    strip: { y: 320, from: 0, to: 100, unit: "s", caption: "human time (1 ns becomes 1 s)", every: 25 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "cpu", to: "l1", label: "read a" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "l1", to: "cpu", label: "a" },
      { kind: "say", at: 1.3, actor: "cpu", text: "a after 1 s", tone: "good" },
      { kind: "tag", at: 1.3, row: 0, value: 1, label: "cache 1 s", tone: "good" },
      { kind: "fly", at: 1.6, dur: 1.0, from: "cpu", to: "mem", label: "read b" },
      { kind: "wait", at: 1.6, dur: 3.0, actor: "cpu", label: "waiting {n} s", doneLabel: "waited 100 s", total: 100 },
      { kind: "fly", at: 3.6, dur: 1.0, from: "mem", to: "cpu", label: "b" },
      { kind: "say", at: 4.6, actor: "cpu", text: "b after 100 s", tone: "warn" },
      { kind: "tag", at: 4.6, row: 1, value: 100, label: "memory 100 s", tone: "warn" },
      { kind: "verdict", at: 4.9, text: "Memory is 100 times slower", tone: "warn" },
    ],
    loop: 8,
  },
};
