---
artifact: canvas-spec
course: career-brand
chapter: "3.5"
beat: 5
slug: career-m3-timing-sheet
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Time it as it is done today

## Teaching claim
To claim time saved, time the task as it is done today, for a stated window, and use the median. People recall times as shorter than they were.

## Why this visual
A timing sheet filled over two fortnights gives a before median and an after median that anyone can re-check.

## Data
Numbers are the canon's (the print shop invoice script): two weeks, 10 working days, before the script: 64 invoices, median 7 minutes each. Two weeks after: 61 invoices, median 1 minute each (checking the PDF). Net about 3 hours a week after upkeep (see `career-m3-time-saved-net`).

```json
{
  "title": "Time it as it is done today",
  "purpose": "Before the script, Areej and the shop's assistant time 64 invoices over two weeks; the median is 7 minutes. Two weeks after, they time 61; the median is 1 minute. The sheet is the proof.",
  "limits": "Areej is a fictional fellow and her numbers are illustrative. Two fortnights are a small sample and a before and after comparison is a weak design; the sheet says what else changed. Use the median, not the average, because a few slow invoices distort the average.",
  "hint": "Two fortnights on one sheet.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "assistant", "label": "Assistant", "kind": "user", "sub": "times each one", "x": 62, "y": 110 },
      { "id": "sheet", "label": "Timing sheet", "kind": "note", "sub": "10 working days", "x": 358, "y": 110 },
      { "id": "result", "label": "Median", "kind": "note", "sub": "per invoice", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "assistant", "to": "sheet", "label": "64 invoices" },
      { "kind": "say", "at": 1.4, "actor": "sheet", "text": "before: 7 min", "tone": "warn" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "assistant", "to": "sheet", "label": "61 invoices" },
      { "kind": "say", "at": 3.7, "actor": "sheet", "text": "after: 1 min", "tone": "good" },
      { "kind": "say", "at": 4.1, "actor": "result", "text": "7 min to 1 min", "tone": "good" },
      { "kind": "verdict", "at": 4.8, "text": "Time it as it is done today", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The after number was timed the same way as the before number. That is why a reader can trust the difference.
