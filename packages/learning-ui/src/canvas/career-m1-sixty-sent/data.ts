import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.1 beat 1: Sixty applications, no replies.
// Sending many applications is not the same as being read: Bashar sends 60 in six weeks and nothing comes back.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1SixtySent: SceneSpec = {
  kind: "scene",
  title: "Sixty applications, no replies",
  purpose: "Bashar, a fictional backend engineer, sends application after application over six weeks. Founders' inboxes stay quiet.",
  limits: "Bashar is a fictional fellow and the story is illustrative. No reply does not tell us why: the picture does not claim to know what each reader thought.",
  hint: "Watch six weeks of applications go out.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "bashar", label: "Bashar", kind: "user", sub: "applying", x: 62, y: 120 },
      { id: "founders", label: "Founders", kind: "user", sub: "inboxes", x: 358, y: 120 },
    ],
    strip: { y: 270, from: 0, to: 6, unit: "wk", caption: "weeks of applying", every: 1 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "bashar", to: "founders", label: "application" },
      { kind: "tag", at: 0.5, row: 0, value: 1, label: "wk 1: sending", tone: "accent" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "bashar", to: "founders", label: "application" },
      { kind: "say", at: 2.2, actor: "founders", text: "no reply", tone: "warn" },
      { kind: "tag", at: 2.6, row: 1, value: 3, label: "wk 3: no reply", tone: "warn" },
      { kind: "fly", at: 3, dur: 0.9, from: "bashar", to: "founders", label: "application" },
      { kind: "say", at: 3.8, actor: "bashar", text: "60 sent", tone: "accent" },
      { kind: "tag", at: 4.2, row: 0, value: 6, label: "wk 6: 60 sent", tone: "bad" },
      { kind: "say", at: 4.4, actor: "founders", text: "0 replies", tone: "bad" },
      { kind: "verdict", at: 5, text: "60 applications, no replies", tone: "bad" },
    ],
    loop: 9,
  },
};
