import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 1.3 "The single-cause trap".
// Huda checks every cause her family named against her records, her customers
// and her oven, and keeps a running count of how many of the 20 missing orders
// each one explains. Several causes add up; the price, her mother's single
// cause, explains 2. See spec.md.
export const hudaCausesAddUp: SequenceSpec = {
  kind: "sequence",
  title: "How many of the 20 missing orders does each cause explain?",
  purpose: "Check each possible cause against evidence and watch the count of explained orders grow, one cause at a time.",
  summary:
    "Huda writes down 20 missing orders. The school calendar explains 12. Messages from regular customers and an oven thermometer explain 4 more through dry cakes. The price explains 2 and a customer who was away explains 1. The summer before was just as hot and home orders did not fall, so the heat shows no sign. Nobody mentions the new shop. With 1 order not known, the causes add up to 20.",
  actors: [
    { name: "Huda", sub: "checks" },
    { name: "Records", sub: "notebook, calendar" },
    { name: "Customers", sub: "messages" },
    { name: "Oven", sub: "thermometer" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "write the size",
      title: "Write the effect with its size",
      note: "A normal month brings about 60 orders. Last month brought 40. So the causes she finds should add up to about 20 orders.",
      chips: ["explained: 0 of 20"],
    },
    {
      from: 0,
      to: 1,
      label: "school calendar",
      title: "School holidays: 12 orders",
      note: "The calendar shows schools closed at the start of the month, and teachers placed no class party orders. That is 12 orders.",
      chips: ["explained: 12 of 20"],
    },
    {
      from: 0,
      to: 2,
      label: "ask regulars",
      title: "Seven regulars ordered less",
      note: "Huda messages the seven regular customers who ordered less. Four say their last cake was dry. Two say the new price is a little high. One was away visiting family.",
      chips: ["dry: 4", "price: 2", "away: 1"],
    },
    {
      from: 0,
      to: 3,
      label: "thermometer",
      tone: "good",
      outcome: "dry cakes: 4",
      title: "Dry cakes: 4 orders",
      note: "The thermometer shows the new oven runs about 20 degrees Celsius hot. A measurement now backs up what four customers said.",
      chips: ["explained: 16 of 20"],
    },
    {
      from: 2,
      to: 0,
      label: "price, a trip",
      title: "Price: 2 orders, a trip: 1 order",
      note: "Two customers named the price and one was away. These are real causes, but small ones.",
      chips: ["explained: 19 of 20"],
    },
    {
      from: 0,
      to: 1,
      label: "the summer before",
      tone: "warn",
      outcome: "no sign",
      title: "Heat: check another hot summer",
      note: "The summer before was just as hot, and her home orders did not fall then. So the heat shows no sign of being a cause this time.",
      chips: ["explained: 19 of 20"],
    },
    {
      from: 0,
      to: 2,
      label: "the new shop?",
      tone: "warn",
      outcome: "not shown",
      title: "New shop: nobody mentions it",
      note: "No customer mentions the new shop. Huda keeps it on her list as 'not shown' and plans to check the timing of the drop.",
      chips: ["explained: 19 of 20"],
    },
    {
      from: 0,
      to: 0,
      label: "add it up",
      tone: "good",
      outcome: "20 of 20",
      title: "Several causes add up",
      note: "12 + 4 + 2 + 1 = 19, and 1 new-customer order is not known: 20 in all. Her mother's single cause, the price, explains 2 of the 20.",
      chips: ["12 + 4 + 2 + 1 + 1 = 20"],
    },
  ],
  tryThis: [
    "Before step 6, predict what the summer before shows about the heat. Check at step 6.",
    "At step 8, compare the size of the biggest cause with the size of the price. Which fix would win back more orders?",
  ],
  limits:
    "Customers' reasons are evidence, but not perfect evidence: a polite customer may give a kind reason instead of the real one. The counts are rough, and one order more or less in a month is normal. Some causes also work together, which a simple count does not show.",
};
