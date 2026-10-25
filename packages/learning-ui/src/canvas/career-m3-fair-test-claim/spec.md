---
artifact: canvas-spec
course: career-brand
chapter: "3.5"
beat: 1
slug: career-m3-fair-test-claim
kind: phrase-fixer
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Control the test, not the calendar

## Teaching claim
"Last month versus this month" has other changes hidden inside it. A test you control keeps the script, the data and the machine the same and changes one thing.

## Why this visual
The phrase fixer shows a weak test plan as a phone card. Tapping the weak parts turns it into the plan Areej actually ran, and the facts counter rises from 0 to 3.

## Change from the module brief
The brief makes beat 4 (a page audit run five times) the playable of this chapter. No allowed primitive can show run-to-run noise, so beat 4 becomes a watch-only scene (`career-m3-five-runs`) and the playable moves to this beat, which the phrase fixer fits exactly.

## Data
The fixed plan is Areej's load test from the canon: the same k6 script, an open model with a constant arrival rate of 50 requests per second for 2 minutes, the same seeded database, the same laptop, p95 820 ms before and 95 ms after. The weak version is a made-up plan to be corrected.

```json
{
  "title": "Control the test, not the calendar",
  "purpose": "Tap the weak parts of a test plan that compares two months. Each one says why it is weak and gives what Areej actually did. The card then becomes her controlled plan.",
  "limits": "The weak plan is made up to show common mistakes. Areej's test ran on a laptop, not production, and her cache can serve a list up to 30 seconds old. Areej and her numbers are fictional and illustrative.",
  "config": {
    "segments": [
      { "id": "claim", "text": "My cache made the events list faster:", "fineWhy": "A clear claim. The test must now back it." },
      { "id": "months", "text": "I compared last month with this month,", "weak": { "why": "Other things changed between the months.", "fix": "I used the same script, data and laptop before and after," } },
      { "id": "once", "text": "ran it once on whatever laptop I had,", "weak": { "why": "One run on a changing machine proves little.", "fix": "ran 50 requests per second for 2 minutes," } },
      { "id": "felt", "text": "and it felt quick.", "weak": { "why": "A feeling is not a measurement.", "fix": "and p95 fell from 820 ms to 95 ms." } }
    ],
    "cardLabel": "A weak test plan",
    "checkableBefore": 0,
    "hint": "Tap each part of the plan that a reader cannot trust.",
    "endNote": "Now only the cache changed. Same script, same data, same laptop, a stated load, and a number a reader can check."
  }
}
```

## What the learner should notice
Nothing about the cache changed between the two cards. What changed is whether the test lets a reader believe the cache did it.
