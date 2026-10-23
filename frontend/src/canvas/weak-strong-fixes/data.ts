import type { FactorSpec } from "../renderers/factor/types";

// Why Things Happen course, chapter 4.5 "Causes, not culprits, and strong fixes".
// Three fixes for unclear order notes in Amal's family shop, from weaker to
// stronger, scored on what makes a fix last. The scores are the course's own
// illustrative judgement; the ranking follows the chapter. See spec.md.
export const weakStrongFixes: FactorSpec = {
  kind: "factor",
  title: "A sign, a checklist or a new order book?",
  purpose: "Change how much each test of a good fix matters, and see whether the weak fix can ever come out ahead.",
  whatThisShows:
    "Three fixes for unclear order notes, each scored from 1 to 5 on four tests of a good fix. Each score is multiplied by how much that test matters, and the results are added up. A reminder asks people to remember; a better design means they do not have to.",
  options: [
    { id: "sign", name: "Sign: check every order" },
    { id: "tick", name: "Tick as you pack" },
    { id: "book", name: "Order book with swap box" },
  ],
  criteria: [
    { id: "busy", name: "Works at the busy moment", weight: 3, scores: { sign: 1, tick: 3, book: 5 } },
    { id: "new-packer", name: "Works for a new packer", weight: 2, scores: { sign: 2, tick: 3, book: 5 } },
    { id: "memory", name: "Needs no one to remember", weight: 3, scores: { sign: 1, tick: 2, book: 4 } },
    { id: "cheap", name: "Cheap and quick to start", weight: 1, scores: { sign: 5, tick: 4, book: 2 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters a lot" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Before you change any weight, predict which fix comes out ahead: the sign or the order book.",
    "Set 'Cheap and quick to start' to 3 and the other three to 1. The sign gets 19 points, and the checklist and the order book tie at 20: even when cost matters most, the sign does not win.",
    "Set every weight to 1. The order book still leads, 16 to 12 for the checklist and 9 for the sign.",
  ],
  limits:
    "The scores are the course's illustrative judgement for one shop, not measurements. The model ignores how well each fix is explained, and a strong fix that does not fit the work can still fail; test it before you rely on it. Weak fixes such as a short talk are often still needed alongside a strong one.",
};
