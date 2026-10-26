import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.2: one frame of Maryam's demo of Halaqa (fictional)
// three ways: with sound on, with the sound off and no words, and with the
// sound off and words on the screen.

const GROUP_CARD: SpecBlock = {
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
};

const SOUND_ON: SpecScreen = {
  alt: "One frame of the demo with the sound on: a large group card with a Join button, a Sound on pill, and a box that shows what the voice says, Here are tonight's groups, tap Join.",
  blocks: [
    { kind: "text", text: "Tonight's groups", size: 18, weight: 700 },
    GROUP_CARD,
    { kind: "pill", text: "Sound: on", tone: "good" },
    {
      kind: "box",
      fill: "muted",
      pad: 10,
      radius: 8,
      children: [{ kind: "text", text: "Voice: Here are tonight's groups. Tap Join to hold a seat.", size: 13 }],
    },
  ],
};

const SOUND_OFF: SpecScreen = {
  alt: "The same frame with the sound off: the group card and a Sound off pill. The voice is silent and there are no words on the screen about what to do.",
  blocks: [
    { kind: "text", text: "Tonight's groups", size: 18, weight: 700 },
    GROUP_CARD,
    { kind: "pill", text: "Sound: off", tone: "warn" },
    {
      kind: "box",
      border: true,
      pad: 10,
      radius: 8,
      children: [{ kind: "text", text: "The voice is silent. Nothing on screen says what to do.", size: 13, tone: "muted" }],
    },
  ],
};

const WORDS: SpecScreen = {
  alt: "The same frame with the sound off and a caption bar that says Tap Join. You are in a group for tonight.",
  blocks: [
    { kind: "text", text: "Tonight's groups", size: 18, weight: 700 },
    GROUP_CARD,
    { kind: "pill", text: "Sound: off", tone: "warn" },
    {
      kind: "box",
      fill: "ink",
      pad: 10,
      radius: 8,
      children: [{ kind: "text", text: "Tap Join. You are in a group for tonight.", size: 14, weight: 600, tone: "inverse" }],
    },
  ],
};

export const productM7MutedFrame: CustomCanvasSpec = {
  kind: "custom",
  title: "The same frame, with and without sound",
  purpose: "Switch between one frame of a demo with the sound on, with the sound off and no words, and with the sound off and words on the screen.",
  limits:
    "This is one frame of a plan for a fictional app. Real feeds differ in how they start a video. The point is that the words on the screen must carry what the voice says. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Sound and words",
    versions: [
      { id: "on", label: "Sound on", screen: SOUND_ON, verdict: { text: "The voice tells the story", tone: "accent" } },
      { id: "off", label: "Sound off", screen: SOUND_OFF, verdict: { text: "A muted viewer gets no words", tone: "bad" } },
      { id: "words", label: "Words", screen: WORDS, verdict: { text: "Words on screen carry it", tone: "good" } },
    ],
    hint: "Touch each version. Ask what a muted viewer learns.",
  }),
};
