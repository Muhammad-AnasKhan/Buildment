import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.2 beat 5: an Experience entry with a real tie, a ledger bullet and attached skills. Card register; Areej is fictional; checked 2026-10.
export const careerM7ExperienceEntry: SceneSpec = {
  kind: "scene",
  title: "Experience: accurate, real, with proof",
  purpose: "An Experience entry names a real tie accurately. A bullet from the claim ledger and the skills used are attached to it. Areej's entry can read 'a parcel delivery company' if she does not want the name public.",
  limits: "Checked 2026-10; if your screen differs, follow your screen. An Arabic or second-language profile is optional and supported. Never list an informal tie as a job.",
  hint: "A real tie, a ledger bullet, skills attached.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "entry", label: "Experience", kind: "note", sub: "accurate name", x: 210, y: 105 },
      { id: "bullet", label: "Ledger bullet", kind: "note", sub: "from the ledger", x: 62, y: 250 },
      { id: "skills", label: "Skills", kind: "note", sub: "attached to it", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "bullet", to: "entry", label: "owned bullet" },
      { kind: "fly", at: 1.6, dur: 1, from: "skills", to: "entry", label: "skills attached" },
      { kind: "say", at: 2.8, actor: "entry", text: "real tie only", tone: "good" },
      { kind: "verdict", at: 3.6, text: "Accurate, real, with proof", tone: "good" },
    ],
    loop: 7.5,
  },
};
