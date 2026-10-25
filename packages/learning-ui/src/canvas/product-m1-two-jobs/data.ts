import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.3: Halaqa's home screen (fictional) as built, then
// shaped for two different jobs: "find a group tonight before an exam" and
// "keep a weekly study habit". The same app changes shape with the job.

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
  alt: "Halaqa's home as built: a question and fourteen feature buttons of the same size, with no job and no one thing first.",
  blocks: [
    { kind: "nav", title: "Halaqa", action: "Profile" },
    { kind: "text", text: "What do you want to do?", size: 17, weight: 700 },
    { kind: "pills", items: FEATURES.map((text) => ({ text })) },
    { kind: "text", text: "Tap any one to start.", size: 12, tone: "muted" },
  ],
};

function groupCard(name: string, when: string, seats: string): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 12,
    gap: 6,
    children: [
      { kind: "text", text: name, size: 14, weight: 600 },
      { kind: "text", text: when, size: 12.5, tone: "muted" },
      { kind: "text", text: seats, size: 12, weight: 600, tone: "accent" },
      { kind: "button", label: "Join" },
    ],
  };
}

const TONIGHT: SpecScreen = {
  alt: "Halaqa's home shaped for the job of finding a group tonight: two groups with their time, place and seats left, and a Join button on each.",
  blocks: [
    { kind: "nav", title: "Halaqa", action: "Start one" },
    { kind: "text", text: "Exam soon? Join a group tonight.", size: 18, weight: 700 },
    groupCard("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left"),
    groupCard("Statistics 101 revision", "Tomorrow 5 pm, online", "4 seats left"),
  ],
};

const WEEKLY: SpecScreen = {
  alt: "Halaqa's home shaped for the job of keeping a weekly study habit: a week of days with the finished ones marked, a progress bar and the next session.",
  blocks: [
    { kind: "nav", title: "Halaqa", action: "Calendar" },
    { kind: "text", text: "Your study week", size: 18, weight: 700 },
    {
      kind: "pills",
      items: [
        { text: "Sun", tone: "good" },
        { text: "Mon", tone: "good" },
        { text: "Tue", tone: "good" },
        { text: "Wed" },
        { text: "Thu" },
        { text: "Fri" },
        { text: "Sat" },
      ],
    },
    { kind: "progress", value: 0.6, label: "Sessions this week" },
    { kind: "text", text: "Keep your streak going.", size: 13, weight: 600 },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 4,
      children: [
        { kind: "text", text: "Next: Statistics 101 revision", size: 13.5, weight: 600 },
        { kind: "text", text: "Tuesday 5 pm", size: 12.5, tone: "muted" },
      ],
    },
  ],
};

export const productM1TwoJobs: CustomCanvasSpec = {
  kind: "custom",
  title: "One app, two jobs",
  purpose: "Switch between Halaqa's home as built and the same home shaped for two jobs: finding a group tonight and keeping a weekly study habit.",
  limits:
    "A real app can serve more than one job, one after another. The point is that a screen can put only one thing first, and the job decides which. Halaqa is a fictional app, and both screens are sketches.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Home screen",
    versions: [
      { id: "built", label: "As built", screen: BUILT, verdict: { text: "Fits no job: nothing first", tone: "bad" } },
      { id: "tonight", label: "Tonight", screen: TONIGHT, verdict: { text: "Fits: find a group tonight", tone: "good" } },
      { id: "weekly", label: "Weekly", screen: WEEKLY, verdict: { text: "Fits: keep a weekly habit", tone: "good" } },
    ],
    hint: "Switch between the three versions of Halaqa's home.",
  }),
};
