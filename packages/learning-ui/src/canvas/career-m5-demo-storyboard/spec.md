---
artifact: canvas-spec
course: career-brand
chapter: "5.4"
beat: 2
slug: career-m5-demo-storyboard
kind: budget-stack
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Cut the filler, keep the core

## Teaching claim
A short demo of the core, 60 to 120 seconds, beats a long tour. Cut the logo, the sign-up and the settings tour, and keep the warning, the sale and the invoice.

## Why this visual
The budget stack is the exact primitive for storyboard frames with a time budget. Frames past the budget are cut, and the learner moves the core frames up.

## Data
Areej's 90-second storyboard is from the canon: the low-stock warning first, then recording a sale, then the invoice. The costs are illustrative. The 60 to 120 second range is course method; a study of lecture videos found engagement fell as videos got longer, which supports "short" in general, not a demo length.

```json
{
  "title": "Cut the filler, keep the core",
  "purpose": "Six storyboard frames for Raqim Stock's demo have a running time. The first 90 seconds are kept, the rest is cut. The learner moves the three core frames up so the warning, the sale and the invoice all make the cut.",
  "limits": "The frame lengths and the 90 seconds are illustrative. The 60 to 120 second range is a course rule, not a research finding. A frame counts as kept when the demo covers at least half of it. Areej is a fictional fellow.",
  "config": {
    "blocks": [
      { "id": "logo", "label": "Logo intro", "cost": 10, "kind": "filler", "note": "Nothing to see yet." },
      { "id": "signup", "label": "Sign-up", "cost": 20, "kind": "filler", "note": "The reader does not need to see this." },
      { "id": "tour", "label": "Tour of the settings", "cost": 25, "kind": "filler", "note": "A tour of menus proves little." },
      { "id": "warning", "label": "The low-stock warning", "cost": 15, "kind": "proof", "note": "The payoff. It should come first." },
      { "id": "sale", "label": "Recording a sale", "cost": 20, "kind": "proof", "note": "The core flow, with the stock going down." },
      { "id": "invoice", "label": "The invoice export", "cost": 15, "kind": "proof", "note": "What the shop owner gets at the end." }
    ],
    "budget": 90,
    "unit": "s",
    "budgetLabel": "Demo length (course rule)",
    "goal": 3,
    "hint": "Tap a frame, then move it up or down. Or drag it."
  }
}
```

## What the learner should notice
No frame got shorter. Only the order changed, and the three that matter now fit inside the time.
