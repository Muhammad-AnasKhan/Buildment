import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.3 (spec beat 6): Study and volunteer roles count
// Data copied from canvas-specs/career-m2-volunteer-full.md. Characters and numbers are fictional and illustrative.

export const careerM2VolunteerFull: SceneSpec = {
  kind: "scene",
  title: "Study and volunteer roles count",
  purpose: "Areej's volunteer card is as full as her internship card: 412 rows, 57 duplicates, 355 imported, and clashes from 9 to 1. The caveat is on the card too: sessions also dropped from three to two a week.",
  limits: "Areej is a fictional fellow and her numbers are illustrative. Every learner has at least a study or volunteer role to write up; school projects, helping a family business and club roles all count.",
  hint: "Watch the reader ask what changed.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "intern", label: "Internship", kind: "note", sub: "a full card", x: 62, y: 110 },
      { id: "volunteer", label: "Volunteer", kind: "note", sub: "a full card", x: 358, y: 110 },
      { id: "reader", label: "Reader", kind: "user", sub: "asks", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "reader", to: "volunteer", label: "what changed?" },
      { kind: "say", at: 1.4, actor: "volunteer", text: "412 rows", tone: "accent" },
      { kind: "say", at: 2.1, actor: "volunteer", text: "57 duplicates", tone: "accent" },
      { kind: "say", at: 2.8, actor: "volunteer", text: "355 imported", tone: "accent" },
      { kind: "say", at: 3.5, actor: "volunteer", text: "clashes 9 to 1", tone: "good" },
      { kind: "say", at: 4.4, actor: "volunteer", text: "sessions 3 to 2", tone: "warn" },
      { kind: "verdict", at: 5, text: "Volunteer work counts, caveat too", tone: "good" },
    ],
    loop: 8.5,
  },
};
