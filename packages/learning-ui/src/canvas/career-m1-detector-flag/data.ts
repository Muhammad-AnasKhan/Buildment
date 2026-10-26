import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 1, chapter 1.4 beat 4: Detectors flag second-language English.
// AI detectors often wrongly flag English written by non-native speakers. If a screen says "AI" about your plain English, that is a known weakness of the tools, not a verdict on you.
// Card register. Fictional people; the picture is a story, not data.
export const careerM1DetectorFlag: SceneSpec = {
  kind: "scene",
  title: "Detectors flag second-language English",
  purpose: "A detector scans a careful essay written in a second language and stamps it as AI. It passes another essay without a question. The tool is wrong, not the writer.",
  limits: "Two essays are a story. Several widely used detectors misclassified more than half of essays by non-native speakers as AI-generated, while classifying US eighth-grade essays accurately. Do not quote a single percentage. If a screen says AI, offer your working document, your drafts and the evidence behind each claim.",
  hint: "Watch what the detector does with each essay.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "detector", label: "Detector", kind: "worker", sub: "stamps AI", x: 210, y: 105 },
      { id: "careful", label: "My essay", kind: "note", sub: "second language", x: 62, y: 250 },
      { id: "other", label: "Other essay", kind: "note", sub: "first language", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "careful", to: "detector", label: "scan" },
      { kind: "say", at: 1.4, actor: "detector", text: "stamps: AI?", tone: "bad" },
      { kind: "say", at: 1.9, actor: "careful", text: "written by me", tone: "good" },
      { kind: "fly", at: 3, dur: 1, from: "other", to: "detector", label: "scan" },
      { kind: "say", at: 4.1, actor: "detector", text: "passes", tone: "accent" },
      { kind: "verdict", at: 4.8, text: "The tool is wrong, not the writer", tone: "warn" },
    ],
    loop: 8.5,
  },
};
