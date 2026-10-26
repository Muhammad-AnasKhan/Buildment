import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.3 beat 1 (watch only): the laptop (192.168.1.23) has a frame ready for a
// friend at 192.168.1.40. It knows the destination IP address, but a Wi-Fi link
// delivers by hardware address, and the destination MAC field is empty. The
// scene stops on that missing field; it shows no failed transfer and no delay.
// The devices and addresses are made up; MACs (02:...) appear in the next beat.
export const netM3SceneNeedMac = {
  kind: "scene",
  title: "You know the IP, not the MAC",
  purpose: "The laptop has the friend's IP address, 192.168.1.40. The Wi-Fi delivers by hardware address, and that field is still empty.",
  limits:
    "Three made-up devices on one Wi-Fi network. The picture stops at the missing field: it shows no failed transfer and no delay. How the laptop finds the MAC is the next beat. A frame is the unit the link delivers, and a MAC is the hardware address it uses.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "wifi", label: "Wi-Fi", kind: "router", sub: "delivers by MAC", x: 210, y: 92 },
      { id: "laptop", label: "Laptop", kind: "worker", sub: "192.168.1.23", x: 70, y: 200 },
      { id: "friend", label: "Friend", kind: "worker", sub: "192.168.1.40", x: 350, y: 200 },
      { id: "frame", label: "Frame", kind: "note", sub: "ready to send", x: 210, y: 290 },
    ],
    events: [
      { kind: "say", at: 0.5, actor: "laptop", text: "wants to send", tone: "accent" },
      { kind: "say", at: 1.4, actor: "frame", text: "dst IP: .40", tone: "good" },
      { kind: "say", at: 3.6, actor: "frame", text: "dst MAC: ?", tone: "warn" },
      { kind: "mark", at: 3.6, actor: "frame", tone: "warn" },
      { kind: "say", at: 4.3, actor: "wifi", text: "needs a MAC", tone: "warn" },
      { kind: "verdict", at: 5, text: "IP known. MAC missing.", tone: "warn" },
    ],
    loop: 9.9,
  },
} satisfies SceneSpec;
