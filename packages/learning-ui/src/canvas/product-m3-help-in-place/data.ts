import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.6: where help goes. Halaqa's first screen
// (fictional) with the same help in three places: a pop-up that covers the
// groups, a hint repeated under every group, and one hint beside the one
// Join button. Help is short and tied to one control, and the person can
// ignore it.

function group(name: string, when: string, seats: string, extra: SpecBlock[] = []): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 10,
    gap: 6,
    children: [
      { kind: "text", text: name, size: 14, weight: 600 },
      { kind: "text", text: when, size: 12.5, tone: "muted" },
      { kind: "text", text: seats, size: 12, weight: 600, tone: "accent" },
      ...extra,
    ],
  };
}

const HINT: SpecBlock = { kind: "text", text: "Tap Join to hold a seat. You can leave any time.", size: 11.5, tone: "muted" };

const POPUP: SpecScreen = {
  alt: "Halaqa's first screen with a help pop-up on top of the page. The pop-up explains Join, seats, chat and files, and has a Got it button. The groups below it cannot be used until it is closed.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    {
      kind: "box",
      border: "accent",
      shadow: true,
      pad: 14,
      gap: 8,
      children: [
        { kind: "text", text: "How Halaqa works", size: 14, weight: 700 },
        { kind: "text", text: "Join a group to hold a seat. Seats are limited. Use chat to talk. Share files in the group.", size: 12.5, tone: "muted" },
        { kind: "button", label: "Got it", full: true },
      ],
    },
    group("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left"),
  ],
};

const EVERYWHERE: SpecScreen = {
  alt: "Halaqa's first screen with the same hint, Tap Join to hold a seat, repeated under every group and every Join button.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    group("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left", [{ kind: "button", label: "Join", full: true }, HINT]),
    group("Statistics 101 revision", "Tomorrow 5 pm, online", "4 seats left", [{ kind: "button", label: "Join", full: true }, HINT]),
  ],
};

const BESIDE: SpecScreen = {
  alt: "Halaqa's first screen with tonight's groups and one hint, Tap Join to hold a seat, beside the first Join button. The second group has none.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    group("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left", [{ kind: "button", label: "Join", full: true }, HINT]),
    group("Statistics 101 revision", "Tomorrow 5 pm, online", "4 seats left"),
  ],
};

export const productM3HelpInPlace: CustomCanvasSpec = {
  kind: "custom",
  title: "Where the help goes",
  purpose: "Switch between three places for the same help: a pop-up over the groups, a hint under every group, and one hint beside the Join button.",
  limits:
    "NN/g's advice on help that appears when it is needed is expert guidance with no sample sizes, so treat it as a heuristic. The best place for help depends on the product. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Help",
    versions: [
      { id: "popup", label: "Pop-up", screen: POPUP, verdict: { text: "Blocks the groups it explains", tone: "bad" } },
      { id: "everywhere", label: "Everywhere", screen: EVERYWHERE, verdict: { text: "Repeated until it is noise", tone: "warn" } },
      { id: "beside", label: "Beside it", screen: BESIDE, verdict: { text: "One hint, at the control", tone: "good" } },
    ],
    hint: "Switch between the three and ask where the help is when you need it.",
    start: "popup",
  }),
};
