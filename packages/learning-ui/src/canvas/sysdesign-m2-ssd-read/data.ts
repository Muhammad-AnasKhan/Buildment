import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.2 beat 2: a system call (300 ns) is 5 human minutes; a random 8 KiB SSD
// read (100 microseconds) is 100,000 human seconds, about 28 hours.
export const sysdesignM2SsdRead: SceneSpec = {
  kind: "scene",
  title: "One SSD read takes about a human day",
  purpose: "Your code asks the kernel for 8 KiB from an SSD, with time stretched so 1 ns lasts 1 second.",
  limits: "Numbers are napkin-math estimates (system call 300 ns, random 8 KiB SSD read 100 microseconds, re-measured in March 2026); its author warns some are 2 to 3 times off. A real read may come from the page cache in memory and skip the SSD.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "app", kind: "server", label: "Your code", sub: "read 8 KiB", x: 60, y: 200 },
      { id: "kernel", kind: "worker", label: "Kernel", sub: "system call", x: 190, y: 85 },
      { id: "ssd", kind: "database", label: "SSD", sub: "random read", x: 360, y: 85 },
    ],
    strip: { y: 320, from: 0, to: 30, unit: "h", caption: "human time (1 ns becomes 1 s)", every: 10 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "app", to: "kernel", label: "syscall" },
      { kind: "say", at: 0.8, actor: "kernel", text: "5 min so far" },
      { kind: "tag", at: 0.8, row: 0, value: 0.08, label: "syscall 5 min" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "kernel", to: "ssd", label: "read" },
      { kind: "wait", at: 1.0, dur: 3.2, actor: "app", label: "waiting {n} h", doneLabel: "waited 28 h", total: 28 },
      { kind: "say", at: 1.7, actor: "ssd", text: "100 µs real", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 0.5, from: "ssd", to: "kernel", label: "data" },
      { kind: "fly", at: 3.8, dur: 0.5, from: "kernel", to: "app", label: "8 KiB" },
      { kind: "say", at: 4.3, actor: "app", text: "got it: 28 h", tone: "warn" },
      { kind: "tag", at: 4.3, row: 1, value: 27.8, label: "SSD read 28 h", tone: "warn" },
      { kind: "verdict", at: 4.6, text: "One SSD read: about a day", tone: "warn" },
    ],
    loop: 8,
  },
};
