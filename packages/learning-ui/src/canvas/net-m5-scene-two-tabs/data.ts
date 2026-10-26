import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.2 beat 1 (watch only): two browser tabs on one laptop (192.168.1.23) talk
// to the same website, 203.0.113.80, port 443. Both tabs show the same laptop
// address. The website sends two replies; each is marked with the port of the
// tab it is for (51234 and 51236), and each arrives at the right tab. The
// ports are chosen for the picture. The website uses a documentation address.
export const netM5SceneTwoTabs = {
  kind: "scene",
  title: "Two tabs, one address, two replies",
  purpose: "Two tabs on one laptop ask the same website for a page. Both replies come back to the same laptop address, and each reaches the right tab.",
  limits:
    "One made-up laptop with two tabs and one website. The ports 51234 and 51236 are chosen for the picture; a real computer picks its own. A real browser may also send both tabs' requests down one connection, which is not drawn. How the laptop tells the replies apart is the next beat.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "tab1", label: "Tab 1", kind: "worker", sub: "192.168.1.23", x: 70, y: 110 },
      { id: "tab2", label: "Tab 2", kind: "worker", sub: "192.168.1.23", x: 70, y: 230 },
      { id: "site", label: "Website", kind: "server", sub: "port 443", x: 350, y: 170 },
    ],
    events: [
      { kind: "say", at: 0.4, actor: "tab1", text: "asks for a page", tone: "accent" },
      { kind: "fly", at: 0.7, dur: 2, from: "tab1", to: "site", label: "from 51234" },
      { kind: "say", at: 1.8, actor: "tab2", text: "asks too", tone: "accent" },
      { kind: "fly", at: 2.2, dur: 2, from: "tab2", to: "site", label: "from 51236" },
      { kind: "say", at: 4.3, actor: "site", text: "two replies", tone: "good" },
      { kind: "fly", at: 4.7, dur: 2, from: "site", to: "tab1", label: "to 51234", tone: "good" },
      { kind: "fly", at: 4.7, dur: 2, from: "site", to: "tab2", label: "to 51236", tone: "good" },
      { kind: "say", at: 6.8, actor: "tab1", text: "got its page", tone: "good" },
      { kind: "say", at: 6.8, actor: "tab2", text: "got its page", tone: "good" },
      { kind: "verdict", at: 7, text: "One address. The port finds the tab.", tone: "good" },
    ],
    loop: 11.7,
  },
} satisfies SceneSpec;
