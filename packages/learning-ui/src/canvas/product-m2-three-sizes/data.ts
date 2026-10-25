import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.2: the same Halaqa group page (fictional) set in
// one size, in three sizes and in six sizes. Weight and colour are the same
// on all three pages, so size is the only thing that changes. One size gives
// no order; three give a clear one; six, set without regard to importance,
// make the sizes compete.

type Sizes = { title: number; when: number; seats: number; about: number; host: number; button: number };

function page(alt: string, s: Sizes): SpecScreen {
  const line = (text: string, size: number): SpecBlock => ({ kind: "text", text, size });
  return {
    alt,
    blocks: [
      line("Data structures, exam Thursday", s.title),
      line("Tonight 8 pm, library room 2", s.when),
      line("2 seats left", s.seats),
      line("We solve past exam questions on lists and trees.", s.about),
      line("Hosted by Abeer", s.host),
      { kind: "button", label: "Join this group", full: true, size: s.button },
    ],
  };
}

const ONE = page("A group page where every line is the same size, 14, and the same weight and colour.", { title: 14, when: 14, seats: 14, about: 14, host: 14, button: 14 });
const THREE = page("A group page with three sizes: the group's name at 22, the details at 16, and the note about the host at 13. Weight and colour are the same as on the other pages.", { title: 22, when: 16, seats: 16, about: 16, host: 13, button: 16 });
const SIX = page("A group page with six sizes, from 28 down to 11. The host line is the largest and the group's name is small, so the sizes do not follow what matters.", { title: 15, when: 21, seats: 11, about: 13, host: 28, button: 18 });

export const productM2ThreeSizes: CustomCanvasSpec = {
  kind: "custom",
  title: "How many sizes",
  purpose: "Switch between one, three and six sizes on the same group page, with weight and colour held the same, and see when the order is clear.",
  limits:
    "Three is a guide from one source, not a law, and a long page may need a fourth step. Weight and colour are the same on all three pages on purpose. The sizes are drawn units, not pixels on your phone. Halaqa and its people are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Number of sizes",
    versions: [
      { id: "one", label: "1 size", screen: ONE, verdict: { text: "Flat: no order", tone: "bad" } },
      { id: "three", label: "3 sizes", screen: THREE, verdict: { text: "The order is clear", tone: "good" } },
      { id: "six", label: "6 sizes", screen: SIX, verdict: { text: "Sizes ignore importance", tone: "warn" } },
    ],
    hint: "Switch between the three versions of the same page.",
    start: "one",
  }),
};
