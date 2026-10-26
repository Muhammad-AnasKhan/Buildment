import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.2 beat 1 (watch only): a phone joins a café Wi-Fi it has never seen. It has
// a radio link but no address, so it cannot talk to anyone by number. It does
// the one thing it can: it shouts to everyone on the link. Only the DHCP server
// helps. The café network 10.5.0.0/24 and its devices are made up. The source
// address 0.0.0.0 comes from the recorded lease in the lab (0.0.0.0.68 >
// 255.255.255.255.67); the four messages themselves are the next beat.
export const netM7SceneNoAddress = {
  kind: "scene",
  title: "A new phone has no address",
  purpose: "A phone joins a café Wi-Fi it has never seen. With no address it cannot talk to anyone, so it shouts to everyone on the link. One server answers.",
  limits:
    "Four made-up devices on one Wi-Fi link in a made-up café network, 10.5.0.0/24. The picture stops after the shout and the server's offer to help: the four DHCP messages are the next beat. A real link may have a switch or an access point between the devices, which this picture leaves out.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "phone", label: "New phone", kind: "phone", sub: "joins Wi-Fi", x: 70, y: 180 },
      { id: "server", label: "DHCP server", kind: "server", sub: "10.5.0.1", x: 350, y: 104 },
      { id: "laptop", label: "Laptop", kind: "worker", sub: "10.5.0.60", x: 350, y: 184 },
      { id: "tablet", label: "Tablet", kind: "phone", sub: "10.5.0.61", x: 350, y: 264 },
    ],
    events: [
      { kind: "say", at: 0.5, actor: "phone", text: "no address", tone: "warn" },
      { kind: "mark", at: 0.5, actor: "phone", tone: "warn" },
      { kind: "say", at: 1.8, actor: "phone", text: "asks everyone", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 2, from: "phone", to: "server", label: "from 0.0.0.0" },
      { kind: "fly", at: 1.8, dur: 2, from: "phone", to: "laptop", label: "from 0.0.0.0" },
      { kind: "fly", at: 1.8, dur: 2, from: "phone", to: "tablet", label: "from 0.0.0.0" },
      { kind: "say", at: 4.1, actor: "server", text: "I give out IPs", tone: "good" },
      { kind: "mark", at: 4.1, actor: "server", tone: "good" },
      { kind: "say", at: 4.1, actor: "laptop", text: "not for me" },
      { kind: "say", at: 4.1, actor: "tablet", text: "not for me" },
      { kind: "verdict", at: 5.4, text: "Everyone hears. One server helps.", tone: "good" },
    ],
    loop: 9.9,
  },
} satisfies SceneSpec;
