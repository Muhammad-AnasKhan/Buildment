---
artifact: canvas-spec
course: career-brand
chapter: "3.5"
beat: 4
slug: career-m3-five-runs
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: One audit run can mislead

## Teaching claim
A page audit score varies from run to run. One run is weak proof. Run it several times and use the median; a median of five is about twice as stable as one run.

## Why this visual
Five scores scatter along one strip and the median lands between them. Seeing the scatter is the claim.

## Change from the module brief
The brief makes this beat playable with a Run button and data-driven noise. None of the allowed primitives can do that, and a custom canvas is not justified for one beat. It is a watch-only scene; the chapter's playable moves to beat 1 (`career-m3-fair-test-claim`).

## Data
The scores are illustrative. Sorted they are 88, 91, 93, 96, 98, so the median is 93. A Lighthouse score is lab data; Core Web Vitals judged at the 75th percentile of real page loads are field data (checked 2026-10).

```json
{
  "title": "One audit run can mislead",
  "purpose": "The same page is audited five times. The scores scatter from 88 to 98. The median of the five is 93. One run on its own would have said 88 or 98.",
  "limits": "The scores are made up to show the spread. Lighthouse results vary with network, hardware and the page itself; its documentation recommends several runs and the median. A good lab score is not proof the site is fast for real users. Checked 2026-10.",
  "hint": "Five runs of the same page.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "audit", "label": "Page audit", "kind": "worker", "sub": "same page", "x": 62, "y": 110 },
      { "id": "you", "label": "You", "kind": "user", "sub": "runs it 5 times", "x": 358, "y": 110 }
    ],
    "strip": { "y": 285, "from": 85, "to": 100, "unit": "pts", "caption": "audit score, five runs", "every": 5 },
    "events": [
      { "kind": "tag", "at": 0.5, "row": 1, "value": 91, "label": "run 1: 91", "tone": "accent" },
      { "kind": "tag", "at": 1.2, "row": 1, "value": 96, "label": "run 2: 96", "tone": "accent" },
      { "kind": "tag", "at": 1.9, "row": 0, "value": 88, "label": "run 3: 88", "tone": "accent" },
      { "kind": "tag", "at": 2.6, "row": 0, "value": 98, "label": "run 4: 98", "tone": "accent" },
      { "kind": "tag", "at": 3.3, "row": 0, "value": 93, "label": "run 5: 93", "tone": "accent" },
      { "kind": "line", "at": 4.1, "value": 93, "label": "median 93" },
      { "kind": "verdict", "at": 4.8, "text": "One run is weak proof; use the median", "tone": "warn" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
No single run is wrong. They are all honest runs of a noisy test, and the median is the number to quote.
