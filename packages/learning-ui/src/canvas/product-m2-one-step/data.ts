import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.4: the Halaqa list (fictional) with gaps that wander
// (5, 17, 6, 13, 9) and with one spacing step (4 inside a group, 24 between).
// The words and the order are the same. Every gap on the second page is a
// multiple of 4, so the rhythm is steady.

const GROUPS = [
  { name: "Data structures, exam Thursday", when: "Tonight 8 pm, library room 2" },
  { name: "Statistics 101 revision", when: "Tomorrow 5 pm, online" },
  { name: "Arabic literature reading", when: "Saturday 10 am, cafe" },
];

function list(alt: string, gaps: number[]): SpecScreen {
  // gaps: inside group 1, between 1 and 2, inside 2, between 2 and 3, inside 3
  const blocks: SpecBlock[] = [{ kind: "nav", title: "Study groups" }, { kind: "space", height: 12 }];
  GROUPS.forEach((g, i) => {
    blocks.push({ kind: "text", text: g.name, size: 14, weight: 600 });
    blocks.push({ kind: "space", height: gaps[i * 2] });
    blocks.push({ kind: "text", text: g.when, size: 12.5, tone: "muted" });
    if (i < GROUPS.length - 1) blocks.push({ kind: "space", height: gaps[i * 2 + 1] });
  });
  return { alt, gap: 0, blocks };
}

const STRAYS = list("Three study groups. The gaps are 5, 17, 6, 13 and 9, so the rhythm of the list wanders.", [5, 17, 6, 13, 9]);
const STEP = list("The same three study groups. Inside each group the gap is 4, and between groups it is 24, so the rhythm is steady.", [4, 24, 4, 24, 4]);

export const productM2OneStep: CustomCanvasSpec = {
  kind: "custom",
  title: "One spacing step",
  purpose: "Switch between a list whose gaps wander and the same list with every gap taken from one step, and look at the rhythm.",
  limits:
    "A step is a convention for consistency, not a test result, and any single step works. The effect is small at one glance and adds up across a whole app. The amounts are drawn units. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Gaps",
    versions: [
      { id: "strays", label: "Strays", screen: STRAYS, verdict: { text: "The gaps wander", tone: "warn" } },
      { id: "step", label: "One step", screen: STEP, verdict: { text: "One step, steady rhythm", tone: "good" } },
    ],
    hint: "Switch between the two lists and follow the rhythm of the gaps.",
    start: "strays",
  }),
};
