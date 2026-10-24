import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.1 beat 1 ("Her balance went back in time"). A deposit shows in the app, and the next look at the balance shows the old number.
export const sysdesignM11BalanceBack: SceneSpec = {
  kind: "scene",
  title: "Mariam's balance goes back in time",
  purpose: "She deposits 500 and sees 1,500. A moment later she looks again, a different copy of the data answers, and it still says 1,000.",
  limits: "Mariam and the bank app are a made-up course story. The copy takes several seconds here so you can watch it; a real copy is usually much closer. Only two copies are drawn.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "mariam", label: "Mariam", kind: "phone", sub: "balance app", x: 80, y: 170 },
      { id: "a", label: "Copy A", kind: "database", sub: "balance 1,000", x: 340, y: 105 },
      { id: "b", label: "Copy B", kind: "database", sub: "balance 1,000", x: 340, y: 235 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "mariam", text: "deposit 500" },
      { kind: "fly", at: 0.5, dur: 0.9, from: "mariam", to: "a", label: "deposit 500" },
      { kind: "say", at: 1.4, actor: "a", text: "balance 1,500", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "a", to: "mariam", label: "1,500", tone: "good" },
      { kind: "say", at: 2.4, actor: "mariam", text: "sees 1,500", tone: "good" },
      { kind: "say", at: 3.2, actor: "mariam", text: "look again" },
      { kind: "fly", at: 3.3, dur: 0.9, from: "mariam", to: "b", label: "balance?" },
      { kind: "mark", at: 4.2, actor: "b", tone: "bad" },
      { kind: "fly", at: 4.3, dur: 0.9, from: "b", to: "mariam", label: "1,000", tone: "bad" },
      { kind: "say", at: 5.2, actor: "mariam", text: "sees 1,000", tone: "bad" },
      { kind: "verdict", at: 5.3, text: "Her balance went back in time", tone: "bad" },
    ],
    loop: 8,
  },
};
