import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 7.4 "Side effects".
// Yara's two-week free delivery pilot: the watch list and stop rule are
// written first, the goal is met, a side effect (returned coasters) crosses
// the stop rule, and the plan changes. See spec.md.
export const pilotWithAStopRule: SequenceSpec = {
  kind: "sequence",
  title: "A small pilot with a stop rule",
  purpose: "See a pilot where the watch list is written first, the goal is met, and a side effect crosses the stop rule.",
  summary:
    "Before the pilot, Yara writes her main measure, two watch measures and a stop rule. For two weeks, delivery is free on orders of 100 shekels or more. Customers add coasters, and the average order rises from 95 to 112 shekels. But returns rise from 5 in 100 orders to about 15 in 100, above her stop rule of 10. She lowers the free delivery line to 80 shekels and runs a second pilot.",
  actors: [
    { name: "Yara", sub: "online shop" },
    { name: "Customers" },
    { name: "Delivery", sub: "local service" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "write watch list",
      title: "Before the pilot: the watch list",
      note: "Yara writes three lines in her notebook before anything changes: the main measure, the watch measures for the side effects she fears, and a stop rule.",
      chips: ["main: average order", "watch: returns per 100", "watch: coasters in stock", "stop: above 10 in 100"],
    },
    {
      from: 0,
      to: 1,
      label: "free delivery 100+",
      title: "A small try, labelled as a try",
      note: "For two whole weeks only, delivery is free on orders of 100 shekels or more. Yara pays the 15 shekels herself on those orders.",
      chips: ["two weeks only"],
    },
    {
      from: 1,
      to: 0,
      label: "add a coaster",
      tone: "good",
      outcome: "average 112",
      title: "The goal is met",
      note: "Many customers looking at an 80-shekel mug add a 25-shekel coaster to reach 100. The average order rises from 95 to 112 shekels.",
      chips: ["before: 95 shekels", "pilot: 112 shekels"],
    },
    {
      from: 1,
      to: 2,
      label: "send coasters back",
      tone: "bad",
      title: "A side effect starts",
      note: "Some customers did not really want the coaster. They send it back through the delivery service, and each return costs Yara two deliveries and her time.",
    },
    {
      from: 2,
      to: 0,
      label: "10 returns",
      tone: "warn",
      outcome: "about 15 in 100",
      title: "The watch measure moves",
      note: "Returned orders: 3 in 60 before the pilot (5 in 100), 10 in 66 during it (about 15 in 100). Eight of the 10 were coasters added to an 80-shekel mug and sent back unused.",
    },
    {
      from: 0,
      to: 0,
      label: "check stop rule",
      tone: "warn",
      outcome: "line crossed",
      title: "The stop rule decides",
      note: "About 15 in 100 is above the line of 10 that Yara wrote before she started. The decision is already made: change the plan. She does not move the line.",
    },
    {
      from: 0,
      to: 1,
      label: "free from 80",
      tone: "good",
      outcome: "second pilot",
      title: "Change the plan and try again small",
      note: "Now any mug alone qualifies, so nobody has to add a coaster they do not want. Yara runs a second two-week pilot with the same watch list.",
    },
  ],
  tryThis: [
    "Before step 3, predict whether the average order will really rise during the pilot.",
    "At step 6, imagine Yara had written no stop rule. Which number would she have looked at, and what would she have decided?",
  ],
  limits:
    "Two weeks with about 60 orders is a small test, so each result is a hint, not proof. Comparing with the two weeks before can also mislead, because orders move up and down on their own. Repeating the pilot, or switching the offer on and off in alternate weeks, gives a fairer picture.",
};
