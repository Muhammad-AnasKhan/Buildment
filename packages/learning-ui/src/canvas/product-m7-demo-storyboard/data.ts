import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.2: a demo of Halaqa (fictional) planned as a tour
// of menus and settings, and planned as one story with the result early. A
// third version shows one frame of the story with the sound off.

function shot(time: string, what: string): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 8,
    radius: 8,
    children: [
      {
        kind: "row",
        gap: 8,
        weights: [1, 4],
        children: [
          { kind: "text", text: time, size: 12, weight: 700, tone: "muted" },
          { kind: "text", text: what, size: 12 },
        ],
      },
    ],
  };
}

const TOUR: SpecScreen = {
  alt: "A storyboard of a tour demo, 2 minutes 10 seconds long: sign-up, settings and menus first, and the first join only at 1 minute 40.",
  frame: "none",
  gap: 8,
  blocks: [
    { kind: "nav", title: "Storyboard: the tour" },
    shot("0:00", "Title card: Halaqa demo"),
    shot("0:10", "Sign up with an email and a password"),
    shot("0:35", "Settings: dark mode, profile theme"),
    shot("1:05", "Menu: chat, files, polls, voice rooms"),
    shot("1:40", "Search for a group and join one"),
    { kind: "stat", value: "1:40", label: "The join happens at 1:40 of 2:10", tone: "bad" },
  ],
};

const STORY: SpecScreen = {
  alt: "A storyboard of one story, 1 minute 10 seconds long: tonight's groups on screen at the start, the join at 10 seconds, the result as a caption at 40 seconds.",
  frame: "none",
  gap: 8,
  blocks: [
    { kind: "nav", title: "Storyboard: one story" },
    shot("0:00", "Tonight's groups, seats left. Caption: Find a group for tonight."),
    shot("0:10", "Tap Join on the 8 pm group"),
    shot("0:25", "Caption: You are in. 1 seat left."),
    shot("0:40", "Caption: 4 of 5 classmates joined in their first visit"),
    shot("1:00", "End card: try it as a guest"),
    { kind: "stat", value: "0:10", label: "The join happens at 0:10 of 1:10", tone: "good" },
  ],
};

const ONE_FRAME: SpecScreen = {
  alt: "One frame of the story with the sound off: a large group card with a Join button, and a caption bar that says what to do.",
  blocks: [
    { kind: "text", text: "Tonight's groups", size: 18, weight: 700 },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 8,
      children: [
        { kind: "text", text: "Data structures, exam Thursday", size: 15, weight: 600 },
        { kind: "text", text: "Tonight 8 pm, library room 2", size: 13, tone: "muted" },
        { kind: "text", text: "2 seats left", size: 13, weight: 600, tone: "accent" },
        { kind: "button", label: "Join", full: true, size: 15 },
      ],
    },
    {
      kind: "box",
      fill: "ink",
      pad: 10,
      radius: 8,
      children: [{ kind: "text", text: "Tap Join. You are in a group for tonight.", size: 14, weight: 600, tone: "inverse" }],
    },
    { kind: "pill", text: "Sound: off", tone: "warn" },
  ],
};

export const productM7DemoStoryboard: CustomCanvasSpec = {
  kind: "custom",
  title: "Tour or story",
  purpose: "Switch between two storyboards of the same app, a tour and one story, and then look at one frame of the story with the sound off.",
  limits:
    "The times and captions are a plan for a fictional app, not a rule. Your own story will have different shots; what matters is that the person, the job and the result come early. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Demo plan",
    versions: [
      { id: "tour", label: "Tour", screen: TOUR, verdict: { text: "The join comes at 1:40", tone: "bad" } },
      { id: "story", label: "Story", screen: STORY, verdict: { text: "The join comes at 0:10", tone: "good" } },
      { id: "frame", label: "One frame", screen: ONE_FRAME, verdict: { text: "Clear with the sound off", tone: "good" } },
    ],
    hint: "Touch each plan. Look at when the join happens.",
  }),
};
