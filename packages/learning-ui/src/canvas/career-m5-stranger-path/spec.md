---
artifact: canvas-spec
course: career-brand
chapter: "5.2"
beat: 3
slug: career-m5-stranger-path
kind: budget-stack
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: The stranger's path to a first screen

## Teaching claim
Reviewers give you seconds, not minutes. If the first thing they meet is a sleeping demo and a sign-up, they leave before the useful screen. Put a page that needs nothing first.

## Why this visual
The budget stack spends a stranger's patience down a path of steps. The learner reorders so the case study page and a screenshot come before the demo and the sign-up.

## Change from the module brief
The brief imagines toggling obstacles on a state machine. The same claim is shown by reordering the stranger's path: the steps cost taps, the useful screens are the proof, and moving them up is the fix. The unit is taps, not seconds, because the module brief says no number of seconds is given for a reader's patience.

## Data
```json
{
  "title": "The stranger's path to a first screen",
  "purpose": "A stranger follows a link and spends a few taps of patience. A sleeping demo and a sign-up use them all. The learner moves the case study page and a screenshot to the front so a useful screen comes first.",
  "limits": "The three taps and the cost of each step are illustrative, not measured. Real strangers differ and no study gives a fixed patience. A step counts as reached when the budget covers at least half of it. Free plans sleep and change; check the plan page the week you publish (checked 2026-10).",
  "config": {
    "blocks": [
      { "id": "asleep", "label": "Demo link opens a sleeping app", "cost": 2, "kind": "filler", "note": "A free plan can take about a minute to wake." },
      { "id": "signup", "label": "Sign-up form", "cost": 2, "kind": "filler", "note": "Many strangers will not make an account." },
      { "id": "confirm", "label": "Email confirmation step", "cost": 2, "kind": "filler", "note": "One more door to leave by." },
      { "id": "case", "label": "Case study page, no login", "cost": 1, "kind": "proof", "note": "Opens on a phone and shows the result." },
      { "id": "shot", "label": "Screenshot of the core flow", "cost": 1, "kind": "proof", "note": "A picture works while the demo sleeps." },
      { "id": "demo-login", "label": "Demo login: one button", "cost": 1, "kind": "context", "note": "A ready login with fake data." }
    ],
    "budget": 3,
    "unit": "taps",
    "budgetLabel": "Stranger's patience (example)",
    "goal": 2,
    "hint": "Tap a block, then move it up or down. Or drag it."
  }
}
```

## What the learner should notice
The sleeping demo and the sign-up are still there afterwards, just later. The stranger sees something useful before they run out of patience.
