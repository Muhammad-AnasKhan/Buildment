import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.3: four things replace a vague sentence. Ehab's
// bakery (fictional) shows the same vague line replaced four ways: a price, a
// time, a thing customers did and a thing the bakery gave up.

function bakery(line: string, alt: string): SpecScreen {
  return {
    alt,
    background: "card",
    blocks: [
      { kind: "text", text: "Instead of: We bake with love and passion every day.", size: 11.5, tone: "muted" },
      { kind: "text", text: line, size: 21, weight: 700 },
      { kind: "text", text: "Open 6 am to 2 pm, near the market.", size: 12.5, tone: "muted" },
      { kind: "button", label: "Order bread", full: true },
    ],
  };
}

export const productM5FourFixes: CustomCanvasSpec = {
  kind: "custom",
  title: "Four things make a sentence specific",
  purpose: "Switch between four ways to replace a vague line on a bakery page: a price, a time, a thing customers did and a thing the bakery gave up.",
  limits:
    "Each line is only as good as the fact behind it. A count or a time you did not check is worse than a vague line. The bakery and its numbers are invented for this picture.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Fix",
    hint: "Switch between the four fixes and compare each line with the old one.",
    versions: [
      {
        id: "price",
        label: "Price",
        screen: bakery("A loaf is 3 shekels. A roll is 1.", "A bakery page where the vague line is replaced by a price: a loaf is 3 shekels and a roll is 1."),
        verdict: { text: "A price you can check", tone: "good" },
      },
      {
        id: "time",
        label: "Time",
        screen: bakery("Bread comes out of the oven at 7 am.", "A bakery page where the vague line is replaced by a time: bread comes out of the oven at 7 am."),
        verdict: { text: "A time you can keep", tone: "good" },
      },
      {
        id: "user",
        label: "User did",
        screen: bakery("We counted last week: 31 of 40 buyers came before 8 am.", "A bakery page where the vague line is replaced by a count of what buyers did: 31 of 40 came before 8 am."),
        verdict: { text: "From a real count", tone: "good" },
      },
      {
        id: "gave-up",
        label: "Gave up",
        screen: bakery("One bake a day, so we sell out by noon.", "A bakery page where the vague line is replaced by a limit the bakery chose: one bake a day, so it sells out by noon."),
        verdict: { text: "A limit you chose", tone: "good" },
      },
    ],
  }),
};
