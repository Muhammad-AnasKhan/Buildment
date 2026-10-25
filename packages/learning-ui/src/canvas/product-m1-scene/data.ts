import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.1: Maryam's Halaqa (fictional) in three steps. First
// it had one feature, group search. As built it had fourteen on one home
// screen. Then the number of people who use it each week: three, Maryam, Adel
// and Rawan. The feature names are the course canon.

const FEATURES = [
  "Group search",
  "Create group",
  "Chat",
  "File sharing",
  "Polls",
  "Voice rooms",
  "Streaks",
  "Badges",
  "Leaderboard",
  "Profile themes",
  "Dark mode",
  "Calendar sync",
  "Notifications",
  "AI summary of notes",
];

const FIRST: SpecScreen = {
  alt: "Halaqa after the first evening: one feature, a search for a study group, with one group found for Statistics 101 and a Join button.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    { kind: "field", label: "Find a group", value: "Statistics 101" },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 6,
      children: [
        { kind: "text", text: "Statistics 101 revision", size: 14, weight: 600 },
        { kind: "text", text: "Tomorrow 5 pm, online", size: 12.5, tone: "muted" },
        { kind: "text", text: "4 seats left", size: 12, weight: 600, tone: "accent" },
        { kind: "button", label: "Join" },
      ],
    },
  ],
};

const BUILT: SpecScreen = {
  alt: "Halaqa's home screen as Maryam built it: fourteen feature buttons of the same size, from group search to an AI summary of notes, and no one thing first.",
  blocks: [
    { kind: "nav", title: "Halaqa", action: "Profile" },
    { kind: "text", text: "What do you want to do?", size: 17, weight: 700 },
    { kind: "pills", items: FEATURES.map((text) => ({ text })) },
    { kind: "text", text: "Tap any one to start.", size: 12, tone: "muted" },
  ],
};

const USED: SpecScreen = {
  alt: "Halaqa's numbers this week: fourteen features built and three weekly users, Maryam and her friends Adel and Rawan.",
  blocks: [
    { kind: "nav", title: "Halaqa this week" },
    {
      kind: "row",
      gap: 12,
      children: [
        { kind: "stat", value: "14", label: "features built" },
        { kind: "stat", value: "3", label: "weekly users", tone: "bad" },
      ],
    },
    { kind: "divider" },
    { kind: "text", text: "Maryam, Adel and Rawan.", size: 13, tone: "muted" },
  ],
};

export const productM1Scene: CustomCanvasSpec = {
  kind: "custom",
  title: "Halaqa as Maryam built it",
  purpose: "Step through Halaqa's first evening with one feature, the home screen with fourteen features, and the number of people who use it each week.",
  limits:
    "Maryam, Adel, Rawan and Halaqa are a fictional case. The numbers are the case's own; a real app would read them from its own records.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Step",
    versions: [
      { id: "first", label: "First", screen: FIRST, verdict: { text: "One feature, one evening", tone: "good" } },
      { id: "built", label: "Built", screen: BUILT, verdict: { text: "14 features, nothing first", tone: "warn" } },
      { id: "used", label: "Used", screen: USED, verdict: { text: "3 people use it each week", tone: "bad" } },
    ],
    hint: "Step through what Maryam built and who uses it.",
  }),
};
