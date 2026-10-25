import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.2: the same Halaqa group page (fictional) set in
// one size, in three sizes and in six sizes. One size gives no order; three
// give a clear one; six make the sizes compete.

type Sizes = { title: number; place: number; time: number; seats: number; about: number; host: number };

function page(alt: string, s: Sizes, titleWeight: 400 | 700, flat = false, button = 16): SpecScreen {
  const text = (t: string, size: number, weight: 400 | 600 | 700 = 400, tone: "fg" | "muted" = "fg"): SpecBlock =>
    flat ? { kind: "text", text: t, size, weight: 400, tone: "fg" } : { kind: "text", text: t, size, weight, tone };
  return {
    alt,
    blocks: [
      text("Data structures, exam Thursday", s.title, titleWeight),
      text("Library room 2", s.place, 400, "muted"),
      text("Tonight 8 pm", s.time, 400, "muted"),
      text("2 seats left", s.seats, 600),
      text("We solve past exam questions on lists and trees.", s.about),
      text("Hosted by Abeer", s.host, 400, "muted"),
      { kind: "button", label: "Join this group", full: true, size: button },
    ],
  };
}

const ONE = page("A group page where every line is the same size, 14, and the same weight.", { title: 14, place: 14, time: 14, seats: 14, about: 14, host: 14 }, 400, true, 14);
const THREE = page("A group page with three sizes: the group's name at 22, the details at 16, and the note about the host at 13.", { title: 22, place: 16, time: 16, seats: 16, about: 16, host: 13 }, 700);
const SIX = page("A group page with six different sizes from 28 down to 11, with no pattern.", { title: 28, place: 21, time: 18, seats: 15, about: 13, host: 11 }, 700, false, 15);

export const productM2ThreeSizes: CustomCanvasSpec = {
  kind: "custom",
  title: "How many sizes",
  purpose: "Switch between one size, three sizes and six sizes on the same group page and see when the order of the lines is clear.",
  limits:
    "Three is a guide from one source, not a law, and a long page may need a fourth step. The sizes are drawn units, not pixels on your phone. Halaqa and its people are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Number of sizes",
    versions: [
      { id: "one", label: "1 size", screen: ONE, verdict: { text: "Flat: no order", tone: "bad" } },
      { id: "three", label: "3 sizes", screen: THREE, verdict: { text: "The order is clear", tone: "good" } },
      { id: "six", label: "6 sizes", screen: SIX, verdict: { text: "Noisy: sizes compete", tone: "warn" } },
    ],
    hint: "Switch between the three versions of the same page.",
    start: "one",
  }),
};
