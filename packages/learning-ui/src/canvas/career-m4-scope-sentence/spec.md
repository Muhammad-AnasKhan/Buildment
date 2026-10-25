---
artifact: canvas-spec
course: career-brand
chapter: "4.4"
beat: 2
slug: career-m4-scope-sentence
kind: phrase-fixer
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Set the appetite, watch scope fall

## Teaching claim
A plan that promises everything fits nothing. Fixing the time box, one user, one flow and one number turns a vague promise into a plan a reader can check.

## Why this visual
The phrase fixer shows an over-large plan sentence. Tapping the weak parts replaces each with Areej's actual choice from the canon.

## Change from the module brief
The brief imagines dragging an appetite slider so feature cards fall out. No allowed primitive does that, and a budget stack would label unbuilt features "not seen". The same claim, that the box decides the scope, fits a phrase fixer: the weak parts are the over-large promises and the fixes are the fitted plan.

## Data
From the canon: Raqim Stock for the print shop owner; 6 weeks at about 5 hours a week, so about 30 hours; one user type; one core flow (record a sale, stock goes down, a warning appears); out of scope for the box: supplier ordering, multiple shops, a mobile app; the number is stockouts per month, with a baseline of 5 stockouts in August and September 2025 from the owner's notebook. Areej is a fictional fellow.

```json
{
  "title": "Set the appetite, watch scope fall",
  "purpose": "Tap the weak parts of an over-large project plan. Each says why it does not fit 30 hours and gives what Areej chose: one flow for one shop, a stated time box, and a number to move.",
  "limits": "Areej is a fictional fellow and the plan is illustrative. The baseline of 5 stockouts comes from the owner's notebook and the plan only promises to count, not to improve. A real plan needs more than one sentence.",
  "config": {
    "segments": [
      { "id": "build", "text": "I will build", "fineWhy": "A plain start. What follows must fit." },
      { "id": "scope", "text": "a full stock system for many shops with a mobile app", "weak": { "why": "Far too much for 30 hours.", "fix": "one flow for one shop (record a sale, stock goes down, a warning appears)" } },
      { "id": "time", "text": "in my spare time,", "weak": { "why": "How much time? Set the box first.", "fix": "in 6 weeks at about 5 hours a week (30 hours)," } },
      { "id": "better", "text": "and it will make the shop much better.", "weak": { "why": "Better how? Nothing to measure.", "fix": "and I will count stockouts per month against the 5 in August and September." } }
    ],
    "cardLabel": "A project plan sentence",
    "checkableBefore": 0,
    "hint": "Tap each part that does not fit a time box or cannot be checked.",
    "endNote": "Now the plan names one flow, one time box and one number. Features that do not fit the box are out of scope, not forgotten."
  }
}
```

## What the learner should notice
The fix for each weak part is smaller, not bigger. The plan gets more checkable as it gets more modest.
