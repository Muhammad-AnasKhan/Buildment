import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.3 beat 5: The one-letter and two-letter prefixes are few and hot, so a cache answers them.
export const sysdesignM23PrefixCache: SceneSpec = {
  kind: "scene",
  title: "Short prefixes are answered by a cache",
  purpose: "There are only 26 one-letter and 676 two-letter prefixes, and every shopper types them. A cache holds all 702 answers. A longer prefix is a miss and goes on to the suggest servers.",
  limits: "26 + 676 = 702 counts a to z only. Real catalogues add digits, accents and other alphabets. The cache is refreshed whenever the trie is rebuilt, so its answers are as fresh as the trie.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "types shoes red", x: 70, y: 100 },
      { id: "cache", label: "Cache", kind: "cache", sub: "702 prefixes", x: 350, y: 100 },
      { id: "suggest", label: "Suggest", kind: "server", sub: "full trie", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "phone", to: "cache", label: "s" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "cache", to: "phone", label: "hit", tone: "good" },
      { kind: "fly", at: 2.1, dur: 0.8, from: "phone", to: "cache", label: "sh" },
      { kind: "fly", at: 3.0, dur: 0.8, from: "cache", to: "phone", label: "hit", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.8, from: "phone", to: "cache", label: "shoes r" },
      { kind: "say", at: 4.7, actor: "cache", text: "not kept", tone: "warn" },
      { kind: "fly", at: 4.9, dur: 0.8, from: "cache", to: "suggest", label: "miss", tone: "warn" },
      { kind: "fly", at: 5.8, dur: 0.9, from: "suggest", to: "phone", label: "3 ideas", tone: "good" },
      { kind: "verdict", at: 6.7, text: "Short prefixes never reach the trie", tone: "good" },
    ],
    loop: 9.5,
  },
};
