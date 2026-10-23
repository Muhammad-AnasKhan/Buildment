import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 3.2 "Change one thing at a time".
// Sami tests only his logo price, alternating 60-dollar and 45-dollar weeks
// while everything else is held still. Every number matches the chapter.
// See spec.md.
export const oneChangePriceWeeks: SequenceSpec = {
  kind: "sequence",
  title: "Did the price cut bring Sami's clients?",
  purpose: "Step through six weeks where only the price changes, and see whether the 60-dollar weeks fall back to the old quiet weeks.",
  summary:
    "Sami holds his photo, portfolio, profile text and reply speed still, then alternates his logo price: 60 dollars in weeks 1, 3 and 5, 45 dollars in weeks 2, 4 and 6. The 60-dollar weeks bring 20 enquiries and 8 clients, the 45-dollar weeks 21 enquiries and 9 clients, so the price was not what raised his enquiries, and the higher price earns more.",
  actors: [
    { name: "Sami", sub: "sets the price" },
    { name: "Profile", sub: "only the price moves" },
    { name: "Clients", sub: "send enquiries" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "hold the rest",
      title: "List what stays the same",
      note: "Sami keeps the new photo, the new portfolio and the same profile text. He replies within two hours, posts in no groups and adds no services. Only the price will change, week by week.",
      chips: ["photo", "portfolio", "reply speed", "no group posts"],
    },
    {
      from: 2,
      to: 0,
      label: "week 1 at 60",
      title: "Week 1: 60 dollars",
      note: "7 enquiries, 3 logo clients.",
      chips: ["7 enquiries", "3 clients"],
    },
    {
      from: 2,
      to: 0,
      label: "week 2 at 45",
      title: "Week 2: 45 dollars",
      note: "7 enquiries, 3 logo clients.",
      chips: ["7 enquiries", "3 clients"],
    },
    {
      from: 2,
      to: 0,
      label: "week 3 at 60",
      title: "Week 3: 60 dollars",
      note: "6 enquiries, 2 logo clients.",
      chips: ["6 enquiries", "2 clients"],
    },
    {
      from: 2,
      to: 0,
      label: "week 4 at 45",
      tone: "warn",
      outcome: "noted",
      title: "Week 4: 45 dollars",
      note: "8 enquiries, 3 logo clients. The notebook marks one unusual event: one enquiry came from a friend of the café owner, after a recommendation.",
      chips: ["8 enquiries", "3 clients", "1 referral"],
    },
    {
      from: 2,
      to: 0,
      label: "week 5 at 60",
      title: "Week 5: 60 dollars",
      note: "7 enquiries, 3 logo clients.",
      chips: ["7 enquiries", "3 clients"],
    },
    {
      from: 2,
      to: 0,
      label: "week 6 at 45",
      title: "Week 6: 45 dollars",
      note: "6 enquiries, 3 logo clients.",
      chips: ["6 enquiries", "3 clients"],
    },
    {
      from: 0,
      to: 0,
      label: "add it up",
      tone: "good",
      outcome: "not the price",
      title: "Compare the two kinds of week",
      note: "At 60 dollars: 20 enquiries, 8 clients, 480 dollars. At 45 dollars: 21 enquiries, 9 clients, 405 dollars. The 60-dollar weeks did not fall back toward the old 3 enquiries a week, so the price cut was not what raised them.",
      chips: ["20 vs 21 enquiries", "480 vs 405 dollars"],
    },
    {
      from: 0,
      to: 1,
      label: "back to 60",
      title: "Decide, and keep watching",
      note: "Sami goes back to 60 dollars. Six weeks is a small test, so this is a hint: he will run it again next season, and he keeps watching his enquiries until then.",
    },
  ],
  tryThis: [
    "Before week 1, predict: if the lower price really brought Sami's extra clients, what should the 60-dollar weeks look like?",
    "Find the week the notebook marks. If you leave out that one referral, do the two kinds of week still look alike?",
  ],
  limits:
    "Six weeks is a small test, and one or two enquiries a week can come from luck. Alternating the weeks spreads slow changes in the season across both prices, but it cannot remove them; a comparison group in the same weeks does that better. The test says nothing about the photo or the portfolio, which were held still, or about changes that only work together.",
};
