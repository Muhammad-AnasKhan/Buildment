import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.2: the problem under "add voice rooms". Adel could
// not tell how to join an online study group (fictional Halaqa). The small
// fix is a call link the group's creator adds, shown as one button.

const BEFORE: SpecScreen = {
  alt: "An online study group in Halaqa before the fix: the group is marked online, but the screen has no way to join the call.",
  blocks: [
    { kind: "nav", title: "Statistics 101 revision", back: true },
    { kind: "pills", items: [{ text: "Online", tone: "accent" }, { text: "4 seats left", tone: "neutral" }] },
    { kind: "text", text: "Tomorrow 5 pm", size: 15, weight: 600 },
    { kind: "text", text: "Revising chapters 3 and 4 together.", size: 13, tone: "muted" },
    { kind: "button", label: "Join group", full: true },
  ],
};

const AFTER: SpecScreen = {
  alt: "The same online study group after the fix: the creator added a call link, and a Join call button appears once a student has joined.",
  blocks: [
    { kind: "nav", title: "Statistics 101 revision", back: true },
    { kind: "pills", items: [{ text: "Online", tone: "accent" }, { text: "4 seats left", tone: "neutral" }] },
    { kind: "text", text: "Tomorrow 5 pm", size: 15, weight: 600 },
    { kind: "text", text: "Revising chapters 3 and 4 together.", size: 13, tone: "muted" },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 8,
      children: [
        { kind: "text", text: "Call link from the group's creator", size: 12, tone: "muted" },
        { kind: "button", label: "Join call", full: true },
      ],
    },
  ],
};

export const productM1TheCheaperFix: CustomCanvasSpec = {
  kind: "custom",
  title: "The problem under the request",
  purpose: "Switch between an online study group with no way to join the call and the same group with a call link from its creator.",
  limits:
    "A small fix is not always enough: some problems really do need the big feature. Halaqa and the group are fictional, and the fix is one possible answer, not the only one.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    versions: [
      { id: "before", label: "Before", screen: BEFORE, verdict: { text: "Online, but no way to join", tone: "bad" } },
      { id: "after", label: "After", screen: AFTER, verdict: { text: "A call link, one button", tone: "good" } },
    ],
    hint: "Switch to see the small fix for the problem under the request.",
  }),
};
