import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 8.4 "Go deep with a team": which time-boxed team
// project to read about first depends on the fellow's hours, whether a
// stipend is needed, and whether open source is new. The rules are the
// course's own, built from the programs' pages checked 2026-10-25: Google
// Summer of Code (B70, B71), LFX Mentorship (B72, B73), Outreachy (B74), and
// a community project the fellow joins alone. Every reason ends by sending
// the fellow to the rules page; none is an eligibility ruling.
export const WHICH_TEAM_PROJECT_FITS: ContextPickerConfig = {
  question: "Which team project to read about first?",
  factors: [
    {
      id: "hours",
      label: "Hours a week",
      choices: [
        { id: "h10", label: "Under 10" },
        { id: "h15", label: "About 15" },
        { id: "h30", label: "About 30" },
      ],
    },
    {
      id: "money",
      label: "Need a stipend?",
      choices: [
        { id: "need", label: "Yes" },
        { id: "free", label: "No" },
      ],
    },
    {
      id: "exp",
      label: "Open source so far",
      choices: [
        { id: "new", label: "New to it" },
        { id: "some", label: "Contributed" },
      ],
    },
  ],
  options: [
    { id: "gsoc", label: "GSoC", sub: "90 to 350 hours" },
    { id: "lfx", label: "LFX", sub: "set by project" },
    { id: "outreachy", label: "Outreachy", sub: "13 wks, 30 h/wk" },
    { id: "community", label: "Community", sub: "you join yourself" },
  ],
  rules: [
    {
      when: { money: "need", exp: "some" },
      pick: "lfx",
      why: "GSoC excludes experienced open source developers. LFX pays too. Read its rules page.",
    },
    {
      when: { money: "free" },
      pick: "community",
      why: "No stipend needed, so you set the pace. A project's contributing page is its rules page.",
    },
    {
      when: { money: "need", exp: "new", hours: "h30" },
      pick: "outreachy",
      why: "30 hours a week is its full-time rule. Check who qualifies on its rules page.",
    },
    {
      when: { money: "need", exp: "new", hours: "h15" },
      pick: "gsoc",
      why: "A 175-hour project over 12 weeks is about 15 hours a week. Read its rules page.",
    },
    {
      when: { money: "need", exp: "new", hours: "h10" },
      pick: "gsoc",
      why: "A 90-hour project over 12 weeks is about 8 hours a week. Read its rules page.",
    },
  ],
  fallback: { pick: "community", why: "Start with a project you join yourself. Read its rules page." },
  start: { hours: "h15", money: "need", exp: "new" },
  hint: "Tap a pill to change one fact about the fellow.",
};

export const whichTeamProjectFits: CustomCanvasSpec = {
  kind: "custom",
  title: "Which team project fits?",
  purpose:
    "Change three facts about a fellow: the hours a week, whether a stipend is needed, and whether open source is new. See which team project to read about first, and why.",
  limits:
    "A teaching model with three facts. The rules are this course's own, built from the programs' pages checked 2026-10-25, and they are not an eligibility ruling: each program sets its own rules, dates and country limits, and they change every year. Outreachy also asks about under-representation, which the model leaves out. We could not confirm how stipends reach a fellow in Gaza.",
  component: makeContextPickerCanvas(WHICH_TEAM_PROJECT_FITS),
};
