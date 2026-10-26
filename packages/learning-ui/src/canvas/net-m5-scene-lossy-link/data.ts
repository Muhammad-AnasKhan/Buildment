import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.4 beat 1 (watch only): a file is sent in three parts across a Wi-Fi link.
// The link drops part 2. The sender sends part 2 again, and the phone ends up
// with all three parts, so the file is whole. The picture shows no timer, no
// number of tries and no loss rate: it only shows that a lost part is sent
// again. The devices are made up.
export const netM5SceneLossyLink = {
  kind: "scene",
  title: "A part is lost and the file is still whole",
  purpose: "A file crosses a link that drops one of its three parts. The part is sent again, and the phone ends up with the whole file.",
  limits:
    "Three made-up devices and a file of three parts. The picture shows one drop and one second try. It shows no timer, no loss rate and no count of tries, and it does not say how the sender notices: that is the next beats. How often real links lose packets is not drawn.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "server", label: "Sender", kind: "server", sub: "file: 3 parts", x: 62, y: 170 },
      { id: "wifi", label: "Link", kind: "router", sub: "Wi-Fi", x: 210, y: 170 },
      { id: "phone", label: "Phone", kind: "phone", sub: "has nothing", x: 358, y: 170 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "server", text: "sends 3 parts", tone: "accent" },
      { kind: "fly", at: 0.4, dur: 0.8, from: "server", to: "wifi", label: "part 1" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "wifi", to: "phone", label: "part 1", tone: "good" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "server", to: "wifi", label: "part 2" },
      { kind: "say", at: 2, actor: "wifi", text: "drops part 2", tone: "bad" },
      { kind: "mark", at: 2, actor: "wifi", tone: "bad" },
      { kind: "say", at: 2, actor: "phone", text: "has part 1", tone: "warn" },
      { kind: "fly", at: 2.1, dur: 0.8, from: "server", to: "wifi", label: "part 3" },
      { kind: "fly", at: 2.9, dur: 0.8, from: "wifi", to: "phone", label: "part 3", tone: "good" },
      { kind: "say", at: 3.7, actor: "phone", text: "has 1 and 3", tone: "warn" },
      { kind: "say", at: 4, actor: "server", text: "resends part 2", tone: "accent" },
      { kind: "fly", at: 4.2, dur: 0.8, from: "server", to: "wifi", label: "part 2" },
      { kind: "fly", at: 5, dur: 0.8, from: "wifi", to: "phone", label: "part 2", tone: "good" },
      { kind: "say", at: 5.8, actor: "phone", text: "has 1 2 3", tone: "good" },
      { kind: "verdict", at: 5.9, text: "Part 2 was lost. The file is whole.", tone: "good" },
    ],
    loop: 8.5,
  },
} satisfies SceneSpec;
