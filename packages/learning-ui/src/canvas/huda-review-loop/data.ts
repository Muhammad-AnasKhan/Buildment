import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 6.2 "Loops where more leads to more".
// Huda's review loop: happy customers post reviews, reviews bring new orders,
// orders become delivered cakes and more happy customers. Each turn adds half
// of what she already sells, until the loop meets the oven. See spec.md.
export const hudaReviewLoop: StateMachineSpec = {
  kind: "state-machine",
  title: "Huda's review loop: more leads to more",
  purpose: "Go round the loop that grew Huda's bakery and watch each turn add more than the one before, until it meets a limit.",
  summary:
    "An engagement party gives the first push. Reviews bring new orders, orders become delivered cakes, delivered cakes make happy customers, and happy customers post more reviews. Each four weeks the loop adds half of what Huda already sells: 8, 12, 18, 27 cakes a week. By week 16 customers ask for about 40, more than the oven's 36. Without that limit, week 20 would bring about 60.",
  states: [
    { id: "customers", name: "Happy customers", sub: "tell friends", col: 0, row: 0 },
    { id: "reviews", name: "Reviews posted", sub: "photos, kind words", col: 1, row: 0 },
    { id: "party", name: "Engagement party", sub: "first push", col: 2, row: 0 },
    { id: "delivered", name: "Cakes delivered", sub: "to new homes", col: 0, row: 1 },
    { id: "orders", name: "New orders", sub: "cakes a week", col: 1, row: 1 },
    { id: "oven", name: "Oven limit", sub: "36 a week", col: 2, row: 1 },
  ],
  edges: [
    { from: "party", to: "reviews", label: "photos" },
    { from: "customers", to: "reviews", label: "more" },
    { from: "reviews", to: "orders", label: "so" },
    { from: "orders", to: "delivered", label: "more" },
    { from: "delivered", to: "customers", label: "so" },
    { from: "orders", to: "oven", label: "meets" },
  ],
  steps: [
    {
      state: "party",
      edge: 0,
      title: "The first push",
      note: "A neighbour orders three cakes for her daughter's engagement party. Guests post photos and kind words in the neighbourhood message group.",
    },
    {
      state: "reviews",
      edge: 2,
      title: "Reviews bring orders",
      note: "More people see the reviews and order. In week 1, Huda sells 8 cakes.",
      chips: ["week 1: 8"],
    },
    {
      state: "orders",
      edge: 3,
      title: "Orders become delivered cakes",
      note: "Every order is baked and delivered by her son on his bicycle. More orders mean more cakes in more homes.",
    },
    {
      state: "delivered",
      edge: 4,
      title: "Delivered cakes make happy customers",
      note: "More cakes in more homes mean more happy customers, who tell their friends.",
    },
    {
      state: "customers",
      edge: 1,
      tone: "good",
      outcome: "+4",
      title: "Round once: 8 becomes 12",
      note: "Happy customers post more reviews, and the loop goes round. Every four weeks it adds about half of what she already sells. Half of 8 is 4, so by week 4 she sells 12.",
      chips: ["week 4: 12"],
    },
    {
      state: "reviews",
      edge: 2,
      tone: "good",
      outcome: "+6",
      title: "Round twice: 12 becomes 18",
      note: "Half of 12 is 6, so by week 8 she sells 18. The jump is bigger than last time, because each jump is half of a bigger number.",
      chips: ["week 8: 18"],
    },
    {
      state: "orders",
      edge: 3,
      tone: "good",
      outcome: "+9",
      title: "Round three times: 18 becomes 27",
      note: "Half of 18 is 9, so by week 12 she sells 27. The jumps are 4, 6 and 9. A loop where more leads to more adds more each time.",
      chips: ["week 12: 27"],
    },
    {
      state: "oven",
      edge: 5,
      tone: "warn",
      outcome: "limit",
      title: "The loop meets a limit",
      note: "By week 16, customers ask for about 27 + 13 = 40 cakes a week. The oven bakes 6 a day, 36 a week. Without that limit, the loop would reach about 40 + 20 = 60 by week 20. With it, the extra orders wait.",
      chips: ["week 16: about 40", "oven: 36"],
    },
  ],
  tryThis: [
    "Before the last step, predict how many cakes a week customers would ask for by week 20 if nothing held the loop back. Then check.",
    "Count the jumps: 4, 6, 9, 13. Why does each turn of the loop add more than the one before?",
  ],
  limits:
    "Real loops do not add exactly half every four weeks, and they have many links this picture leaves out, such as prices and the season. The same loop can also run the other way: fewer happy customers bring fewer reviews and fewer orders. Every loop where more leads to more meets a limit in the end.",
};
