import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.2 beat 1: Reading all 200 GB of product text for one query takes about 10 seconds; an index goes straight to the word.
export const sysdesignM23ScanVsIndex: SceneSpec = {
  kind: "scene",
  title: "Reading every product for one query takes seconds",
  purpose: "A scan of the whole catalogue reads 200 GB of text from memory. An index keeps a list of products for each word, so a query reads only the lists it needs.",
  limits: "The 10 seconds is one thread reading memory at about 20 GiB a second (napkin-math, rounded). More threads or machines cut it, but the work per query stays the whole catalogue.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "scan", label: "Catalogue", kind: "database", sub: "200 GB text", x: 70, y: 100 },
      { id: "phone", label: "Phone", kind: "phone", sub: "red shoes", x: 350, y: 168 },
      { id: "index", label: "Index", kind: "database", sub: "list per word", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "scan", label: "red shoes" },
      { kind: "say", at: 1.0, actor: "scan", text: "reads it all", tone: "warn" },
      { kind: "wait", at: 1.0, dur: 2.2, actor: "scan", label: "scanning {n} s", doneLabel: "10 s, too slow", total: 10 },
      { kind: "fly", at: 3.5, dur: 0.9, from: "phone", to: "index", label: "red shoes" },
      { kind: "say", at: 4.4, actor: "index", text: "reads 2 lists", tone: "good" },
      { kind: "fly", at: 4.6, dur: 0.9, from: "index", to: "phone", label: "ids 1, 3", tone: "good" },
      { kind: "verdict", at: 5.5, text: "The index skips the scan", tone: "good" },
    ],
    loop: 8.5,
  },
};
