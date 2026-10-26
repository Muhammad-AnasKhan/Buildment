import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 1.6 beat 5 (watch only): the laptop's ARP request goes to the broadcast MAC
// ff:ff:ff:ff:ff:ff, so every device on the link hears it; only the phone owns
// 192.168.1.20, so only the phone answers, by unicast to the laptop's MAC.
// The devices, their addresses and the MAC 02:00:00:00:00:10 are made up.
export const netM1SceneBroadcastMac: SceneSpec = {
  kind: "scene",
  title: "One broadcast, heard by all, answered by one",
  purpose: "The laptop asks the whole link who has 192.168.1.20. Three devices hear it, and only the phone answers, straight back to the laptop.",
  limits:
    "Four made-up devices and made-up MACs on one Ethernet link; the real ARP request from the lab is in 1.5. ARP itself is explained in module 3: here only the destination MAC matters. A real link may have a switch between the devices, which this picture leaves out.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "laptop", label: "Laptop .10", kind: "worker", sub: "192.168.1.10", x: 70, y: 162 },
      { id: "phone", label: "Phone .20", kind: "phone", sub: "192.168.1.20", x: 350, y: 84 },
      { id: "tv", label: "TV .31", kind: "server", sub: "192.168.1.31", x: 350, y: 162 },
      { id: "printer", label: "Printer .40", kind: "note", sub: "192.168.1.40", x: 350, y: 240 },
    ],
    events: [
      { kind: "say", at: 0, actor: "laptop", text: "asks everyone", tone: "accent" },
      { kind: "fly", at: 0, dur: 2, from: "laptop", to: "phone", label: "to ff:ff:ff:ff:ff:ff" },
      { kind: "fly", at: 0, dur: 2, from: "laptop", to: "tv", label: "to ff:ff:ff:ff:ff:ff" },
      { kind: "fly", at: 0, dur: 2, from: "laptop", to: "printer", label: "to ff:ff:ff:ff:ff:ff" },
      { kind: "say", at: 2.2, actor: "phone", text: "that is me", tone: "good" },
      { kind: "mark", at: 2.2, actor: "phone", tone: "good" },
      { kind: "say", at: 2.2, actor: "tv", text: "hears, no reply" },
      { kind: "say", at: 2.2, actor: "printer", text: "hears, no reply" },
      { kind: "fly", at: 2.7, dur: 2, from: "phone", to: "laptop", label: "to 02:00:00:00:00:10", tone: "good" },
      { kind: "say", at: 4.9, actor: "laptop", text: "got the MAC", tone: "good" },
      { kind: "verdict", at: 4.9, text: "One broadcast, one answer.", tone: "good" },
    ],
    loop: 8.6,
  },
};
