import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 4.4 "Fishbone diagrams".
// Amal's family fills a fishbone for 7 of 60 orders with a wrong or missing
// item, group by group, then Amal checks the paper notes for the 7 orders.
// Thirteen possible causes narrow to two with evidence. Every number matches
// the chapter. See spec.md.
export const fishboneCheckEvidence: SequenceSpec = {
  kind: "sequence",
  title: "From thirteen possible causes to two",
  purpose: "Fill a fishbone group by group, then check it against evidence, and see how many of the possible causes survive.",
  summary:
    "The family lists thirteen possible causes in six groups for 7 wrong orders out of 60. Amal then checks the paper notes for the 7 orders: 4 had unclear notes, 2 had items swapped without asking, 1 has no clear reason. Noise and look-alike packets are not supported, and the new helper's two mistakes came from unclear notes too. Two causes remain, both in steps and information.",
  actors: [
    { name: "Family", sub: "five people" },
    { name: "Fishbone", sub: "possible causes" },
    { name: "Order notes", sub: "the 7 wrong orders" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "steps: 3",
      title: "Steps",
      note: "Orders written on loose scraps of paper. No check of the bag against the order. Swaps made without calling the customer.",
    },
    {
      from: 0,
      to: 1,
      label: "people: 2",
      title: "People",
      note: "Three packers, each packing their own way. A new helper, Yazan, packs on busy days.",
    },
    {
      from: 0,
      to: 1,
      label: "tools: 2",
      title: "Tools",
      note: "One phone line, so orders are taken fast in the rush. No printed order form.",
    },
    {
      from: 0,
      to: 1,
      label: "supplies: 2",
      title: "Supplies",
      note: "Packets that look alike, such as two kinds of lentils. Items that run out.",
    },
    {
      from: 0,
      to: 1,
      label: "information: 2",
      title: "Information",
      note: "Handwriting that is hard to read. Notes that only say 'the usual'.",
    },
    {
      from: 0,
      to: 1,
      label: "surroundings: 2",
      outcome: "13 listed",
      title: "Surroundings",
      note: "A noisy shop in the morning. A dim back store. The fishbone now holds thirteen possible causes. None of them has been checked yet.",
    },
    {
      from: 1,
      to: 2,
      label: "check 7 orders",
      title: "Choose what to check",
      note: "Amal takes the paper notes for the 7 wrong orders from the box under the counter and compares each one with what the customer said was wrong.",
    },
    {
      from: 2,
      to: 0,
      label: "4: unclear notes",
      tone: "good",
      outcome: "supported",
      title: "Unclear notes: 4 of 7",
      note: "Twice the handwriting was hard to read, and twice the note just said 'the usual'.",
    },
    {
      from: 2,
      to: 0,
      label: "2: swaps, no call",
      tone: "good",
      outcome: "supported",
      title: "Swaps without asking: 2 of 7",
      note: "An item had run out, and the packer swapped it without calling. In the last 1 of 7, Amal cannot find a reason. That accounts for all seven.",
    },
    {
      from: 2,
      to: 0,
      label: "noise: no pattern",
      tone: "bad",
      outcome: "not supported",
      title: "Noise",
      note: "The mistakes were spread over busy and quiet mornings: 4 on busy days, 3 on quiet days.",
    },
    {
      from: 2,
      to: 0,
      label: "look-alikes: none",
      tone: "bad",
      outcome: "not supported",
      title: "Look-alike packets",
      note: "In none of the 7 orders was the wrong item a look-alike of the right one.",
    },
    {
      from: 2,
      to: 0,
      label: "Yazan: 2 of 7",
      tone: "warn",
      outcome: "same cause",
      title: "The new helper",
      note: "Yazan packed 2 of the 7, and the others packed 5. Both of his mistakes came from unclear notes, the same cause as the others.",
    },
    {
      from: 0,
      to: 0,
      label: "two remain",
      tone: "good",
      outcome: "2 of 13",
      title: "From thirteen to two",
      note: "Two causes have evidence behind them: unclear order notes, and swaps made without asking. Both sit in steps and information. Neither is a person.",
    },
  ],
  tryThis: [
    "After the sixth step the fishbone is full. Before you step on, predict what Amal can honestly say about the thirteen causes before she checks them.",
    "Which groups do the two supported causes sit in? Is either of them a person?",
  ],
  limits:
    "Seven orders is a small sample, so the checks are a hint about which causes matter most, not proof. The canvas checks only the causes the notes can speak to; a cause the notes cannot show, such as one phone line, is not ruled out, only unchecked. A real fishbone may need more groups or fewer.",
};
