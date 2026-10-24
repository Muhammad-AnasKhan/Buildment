import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.4 beat 3 (A false yes skips a new page).
export const sysdesignM26BloomFalseYes: SceneSpec = {
  kind: "scene",
  title: "A Bloom filter can skip a page it never saw",
  purpose: "The filter answers \"surely not seen\" or \"maybe seen\". A \"no\" is always right. A \"maybe\" is sometimes wrong: about 1 in 100 at 9.6 bits per URL, so about 1 new page in 100 is skipped by mistake.",
  limits: "Two links, one unlucky. The same URL gets the same wrong answer every time until the filter is rebuilt with new hash functions. A page is rarely missed forever, because other links and a later rebuild reach it, but it can be.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "parser", label: "Parser", kind: "worker", sub: "found 2 links", x: 70, y: 100 },
      { id: "bloom", label: "Bloom filter", kind: "cache", sub: "9.6 bits a URL", x: 350, y: 100 },
      { id: "frontier", label: "Frontier", kind: "queue", sub: "empty", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "parser", to: "bloom", label: "new/1" },
      { kind: "say", at: 1, actor: "bloom", text: "no: new", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "bloom", to: "frontier", label: "add new/1", tone: "good" },
      { kind: "say", at: 2, actor: "frontier", text: "1 URL", tone: "accent" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "parser", to: "bloom", label: "new/2" },
      { kind: "say", at: 3.6, actor: "bloom", text: "maybe seen", tone: "warn" },
      { kind: "fly", at: 3.8, dur: 0.8, from: "bloom", to: "parser", label: "skip it", tone: "bad" },
      { kind: "say", at: 4.6, actor: "parser", text: "new/2 lost", tone: "bad" },
      { kind: "mark", at: 4.6, actor: "parser", tone: "bad" },
      { kind: "verdict", at: 4.9, text: "A false yes skips a new page", tone: "warn" },
    ],
    loop: 9,
  },
};
