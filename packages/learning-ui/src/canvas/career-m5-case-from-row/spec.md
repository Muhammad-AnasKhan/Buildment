---
artifact: canvas-spec
course: career-brand
chapter: "5.5"
beat: 2
slug: career-m5-case-from-row
kind: slot-card
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Build it from a ledger row

## Teaching claim
A case study is built from ledger rows, not from memory. Its sections are the problem, the numbers before, what I did and what the team did, the numbers after, what else changed, and what I would do differently.

## Why this visual
The slot card turns Areej's ledger rows R1 and R2 into the six case study slots. A boast and a vague percentage fit nowhere and are refused with a reason.

## Data
Numbers are from the canon (the slow orders report): p95 4.6 s over 14 days before and 0.41 s over 14 days after, from the team dashboard; plans 3,840 ms and 46 ms; a 20 May front-end release; requests 6,300 and 6,100; her lead reviewed and scheduled it; her answer to "what would you do differently" is a slow-query alert. Public names are removed. Areej is a fictional fellow.

```json
{
  "title": "Build it from a ledger row",
  "purpose": "Fill six of the seven parts of Areej's case study from her ledger rows: problem, before, what I did, after, what else changed, and what she would do differently. The seventh part, where to see it, is a link or an image, so it has no snippet. A boast and a vague percentage are refused.",
  "limits": "A real case study has a title, images and a link to the proof. The numbers are from Areej's notes and are illustrative. Names are removed in public; the company is 'a parcel delivery company'.",
  "config": {
    "cardTitle": "Areej's case study",
    "claim": "Fixing a slow report with one index",
    "slots": [
      { "id": "problem", "label": "Problem" },
      { "id": "before", "label": "Before" },
      { "id": "did", "label": "What I did" },
      { "id": "after", "label": "After" },
      { "id": "changed", "label": "Changed too" },
      { "id": "differently", "label": "Differently" }
    ],
    "chips": [
      { "id": "problem", "text": "Operations staff open a slow report many times a day", "slot": "problem", "why": "This is the problem and who felt it." },
      { "id": "before", "text": "p95 4.6 s over 14 days (team dashboard); plan 3,840 ms", "slot": "before", "why": "These are the numbers before, with their source." },
      { "id": "did", "text": "I found the scan and added an index; my lead reviewed and scheduled it", "slot": "did", "why": "This splits my part from the team's part." },
      { "id": "after", "text": "p95 0.41 s over 14 days, same dashboard; plan 46 ms", "slot": "after", "why": "These are the numbers after, same source and window." },
      { "id": "changed", "text": "A 20 May front-end release; requests 6,300 then 6,100", "slot": "changed", "why": "This says what else changed in the window." },
      { "id": "differently", "text": "Add a slow-query alert so the next one is found sooner", "slot": "differently", "why": "This is what she would do differently." },
      { "id": "best", "text": "The best fix of the year", "slot": null, "why": "No one can check this." },
      { "id": "ninety", "text": "Performance improved 90 percent", "slot": null, "why": "No metric, window or source." },
      { "id": "we", "text": "We fixed the whole platform", "slot": null, "why": "'We' hides who did what." }
    ],
    "assembled": "Operations staff open a slow report many times a day. Before: p95 4.6 s over 14 days (team dashboard); plan 3,840 ms. I found the scan and added an index; my lead reviewed and scheduled it. After: p95 0.41 s over 14 days, same dashboard; plan 46 ms. Also changed: a 20 May front-end release; requests 6,300 then 6,100. Differently: add a slow-query alert so the next one is found sooner.",
    "hint": "Tap a chip, then the section it fills. Or drag the chip onto the section.",
    "endNote": "Every section comes from a ledger row. A reader can ask about any of them and find the answer."
  }
}
```

## What the learner should notice
No new number appears. The case study only arranges numbers the ledger already holds, and the three refused chips are the ones that would break that rule.
