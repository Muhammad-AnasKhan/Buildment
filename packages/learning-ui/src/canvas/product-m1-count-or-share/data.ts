import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.5: an invented example for Halaqa (fictional). In
// month 1, 10 students visited and 5 joined a group. In month 2, 100 visited
// and 8 joined. The count of joins rose from 5 to 8, but the share fell from
// 5 of 10 (half) to 8 of 100.

const MONTH_1: SpecScreen = {
  alt: "An invented month 1 for Halaqa: 10 students visited and 5 joined a group, which is 5 of 10, half of the visitors.",
  blocks: [
    { kind: "nav", title: "Halaqa, month 1" },
    {
      kind: "row",
      gap: 12,
      children: [
        { kind: "stat", value: "10", label: "students visited" },
        { kind: "stat", value: "5", label: "joined a group" },
      ],
    },
    { kind: "divider" },
    { kind: "stat", value: "5 of 10", label: "joined: half of the visitors", tone: "good" },
  ],
};

const MONTH_2: SpecScreen = {
  alt: "An invented month 2 for Halaqa: 100 students visited and 8 joined a group, which is 8 of 100. More joined, but a smaller share.",
  blocks: [
    { kind: "nav", title: "Halaqa, month 2" },
    {
      kind: "row",
      gap: 12,
      children: [
        { kind: "stat", value: "100", label: "students visited" },
        { kind: "stat", value: "8", label: "joined a group" },
      ],
    },
    { kind: "divider" },
    { kind: "stat", value: "8 of 100", label: "joined: 8 in every 100", tone: "bad" },
  ],
};

export const productM1CountOrShare: CustomCanvasSpec = {
  kind: "custom",
  title: "The count rose, the share fell",
  purpose: "Switch between an invented month 1 and month 2 for Halaqa and compare the count of students who joined with the share of visitors who joined.",
  limits:
    "The numbers are invented for this example and are not Maryam's checks. A share also needs enough people behind it: with five people in a check, each person is 20 percentage points.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Month",
    versions: [
      { id: "one", label: "Month 1", screen: MONTH_1, verdict: { text: "5 of 10 joined", tone: "good" } },
      { id: "two", label: "Month 2", screen: MONTH_2, verdict: { text: "Count up, share down", tone: "warn" } },
    ],
    hint: "Switch between the two months and compare the count with the share.",
  }),
};
