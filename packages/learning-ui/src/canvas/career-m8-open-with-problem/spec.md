---
artifact: canvas-spec
course: career-brand
chapter: "8.2"
beat: 3
slug: career-m8-open-with-problem
kind: budget-stack
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Start where the reader's question is

## Teaching claim
A busy reader opens your post and keeps reading only if the problem and the result come early. Open with the problem and the result, then show how you know.

## Why this visual
The budget stack is the exact primitive for "what a reader sees before the budget runs out", here applied to post paragraphs. The learner moves the problem and the result above the project history.

## Data
Areej's post is "Same script, same data: what a 30-second cache did to our p95" (canon, about 800 words). Parts: the problem, the test set-up, the before and after, the stale-data trade-off, what she would change. The lengths below are lines of a phone screen and are illustrative. No data claims a specific opening length.

```json
{
  "title": "Start where the reader's question is",
  "purpose": "Six paragraphs of Areej's post are in an order that opens with the history and the thanks. A busy reader runs out of room before the problem and the result. The learner moves them to the top.",
  "limits": "The 10 lines and the length of each paragraph are illustrative. Real readers differ and no study gives an ideal opening length. A paragraph counts as read when the room covers at least half of it. Areej is a fictional fellow.",
  "config": {
    "blocks": [
      { "id": "history", "label": "How the project began", "cost": 4, "kind": "filler", "note": "Real, but the reader did not ask yet." },
      { "id": "thanks", "label": "Thanks to everyone who helped", "cost": 2, "kind": "filler", "note": "Kind. It can go at the end." },
      { "id": "setup", "label": "The test set-up in detail", "cost": 4, "kind": "context", "note": "Needed, but after the reader cares." },
      { "id": "problem", "label": "The problem: a slow events list", "cost": 3, "kind": "proof", "note": "The reader's question starts here." },
      { "id": "result", "label": "The result: p95 820 ms to 95 ms", "cost": 3, "kind": "proof", "note": "Same script, same data, same laptop." },
      { "id": "tradeoff", "label": "The trade-off: lists up to 30 s old", "cost": 3, "kind": "context", "note": "The honest cost of the cache." }
    ],
    "budget": 10,
    "unit": "lines",
    "budgetLabel": "A busy reader (example)",
    "goal": 2,
    "hint": "Tap a paragraph, then move it up or down. Or drag it."
  }
}
```

## What the learner should notice
Nothing was cut. The history and the thanks are still in the post, just after the reader has a reason to care.
