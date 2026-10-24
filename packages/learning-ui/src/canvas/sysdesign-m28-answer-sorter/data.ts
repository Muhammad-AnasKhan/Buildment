import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// 28.3 beat 5: sort eight candidate answers to "why that choice?" into three
// levels. The sentences are condensed from chapters 20, 21, 24, 25 and 26.

export const ANSWER_BUCKETS: SortBucket[] = [
  { id: "claim", label: "Claim only", sub: "no cost named" },
  { id: "cost", label: "Names a cost", sub: "no number" },
  { id: "strong", label: "Strong", sub: "number + switch" },
];

export const ANSWER_CARDS: SortCard[] = [
  {
    id: "cache-faster",
    text: "I would add a cache, because it makes reads faster.",
    answer: "claim",
    why: {
      cost: "It names no cost. 'Faster' is the benefit.",
      strong: "It has no number and no switch point.",
    },
  },
  {
    id: "push-posts",
    text: "Pushing posts to followers makes feeds fast, but each post costs one write per follower.",
    answer: "cost",
    why: {
      claim: "It names a cost: one write per follower.",
      strong: "It gives no number and no point to switch.",
    },
  },
  {
    id: "latest-memory",
    text: "Latest places in memory: 100 MB. A restart empties it for 4 s. A standby if that hurts.",
    answer: "strong",
    why: {
      claim: "It has a number, a cost and a switch point.",
      cost: "It also gives numbers and a switch point.",
    },
  },
  {
    id: "number-messages",
    text: "I would number messages in each chat so the order is right.",
    answer: "claim",
    why: {
      cost: "It says what it does, not what it gives up.",
      strong: "No cost, no number, no switch point.",
    },
  },
  {
    id: "bloom-filter",
    text: "A Bloom filter saves memory, but it can wrongly skip a new page.",
    answer: "cost",
    why: {
      claim: "It names a cost: skipped pages.",
      strong: "It gives no size and no point to switch.",
    },
  },
  {
    id: "authorize-capture",
    text: "Authorize, then capture: 330 provider calls a second. Charge at once if the provider cannot split.",
    answer: "strong",
    why: {
      claim: "It has a number and a switch point.",
      cost: "It also gives a number and a switch point.",
    },
  },
  {
    id: "send-302",
    text: "I would send a 302, because that is what people usually do.",
    answer: "claim",
    why: {
      cost: "'Usual' is not a cost.",
      strong: "No cost, no number, no switch point.",
    },
  },
  {
    id: "push-below-line",
    text: "Push below 100,000 followers: a 20M post is 20M writes. Move the line if write capacity changes.",
    answer: "strong",
    why: {
      claim: "It has a number and says when to move.",
      cost: "It also gives a number and a switch point.",
    },
  },
];

export const sysdesignM28AnswerSorter: CustomCanvasSpec = {
  kind: "custom",
  title: "Strong answers name a cost and a switch",
  purpose: "Sort eight candidate answers to 'why that choice?' into claim only, names a cost, and strong (a number and a switch point), with a short reason after each wrong try.",
  limits:
    "Real answers are messier, and where one stops being strong is a judgment. The sentences are condensed from chapters 20, 21, 24, 25 and 26. Hikaya, Wasla and the others are fictional.",
  component: makeSorterCanvas({
    buckets: ANSWER_BUCKETS,
    cards: ANSWER_CARDS,
    deckLabel: "Candidate says",
    prompt: "Which bucket does this answer go in?",
    hint: "Tap the bucket this answer belongs in, or drag the card onto it.",
    endNote: "A strong answer names what it costs, gives a number, and says when to switch.",
  }),
};
