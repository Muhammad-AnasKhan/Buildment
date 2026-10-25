import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.1: Maryam's Halaqa (fictional) as she built it, with
// fourteen features on one home screen, and the same app seen by how many
// people use it each week. Three: Maryam, Adel and Rawan.

const FEATURES = [
  "Search groups",
  "Create group",
  "Chat",
  "Files",
  "Polls",
  "Voice rooms",
  "Streaks",
  "Badges",
  "Leaderboard",
  "Themes",
  "Dark mode",
  "Calendar sync",
  "Alerts",
  "AI notes",
];

const BUILT: SpecScreen = {
  alt: "Halaqa's home screen as Maryam built it: fourteen feature buttons of the same size, from group search to AI notes, and no one thing first.",
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
  purpose: "Switch between Halaqa's home screen with fourteen features and the number of people who use it each week.",
  limits:
    "Maryam, Adel, Rawan and Halaqa are a fictional case. The numbers are the case's own; a real app would read them from its own records.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "View",
    versions: [
      { id: "built", label: "Built", screen: BUILT, verdict: { text: "14 features, nothing first", tone: "warn" } },
      { id: "used", label: "Used", screen: USED, verdict: { text: "3 people use it each week", tone: "bad" } },
    ],
    hint: "Switch between what Maryam built and who uses it.",
  }),
};
