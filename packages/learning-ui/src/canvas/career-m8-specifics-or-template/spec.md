---
artifact: canvas-spec
course: career-brand
chapter: "8.4"
beat: 2
slug: career-m8-specifics-or-template
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Specifics make it yours

## Teaching claim
A visitor believes a site is yours when it has specifics only you have: your number, your screenshot, your mistake. Passing an AI detector is not the goal.

## Why this visual
A template page and a specific page go to the same visitor, who believes only one.

## Data
Google does not ban AI content but warns against pages without added value and asks you to fact-check AI content and consider saying how it was made; its people-first page asks for original information, first-hand expertise and honest authorship. Detectors misclassify non-native English. Checked 2026-10.

```json
{
  "title": "Specifics make it yours",
  "purpose": "A visitor meets a template page with a stock photo and 'loves problems', and thinks it could be anyone's. Then the visitor meets a page with a real number and a real mistake, and believes it.",
  "limits": "Checked 2026-10. This is a course method supported by Google's originality questions, not a guarantee about any search engine. Detectors misjudge second-language English, so passing one is not a goal.",
  "hint": "Same visitor, two pages.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "template", "label": "Template", "kind": "note", "sub": "stock photo", "x": 62, "y": 110 },
      { "id": "specific", "label": "Specific", "kind": "note", "sub": "real screenshot", "x": 358, "y": 110 },
      { "id": "visitor", "label": "Visitor", "kind": "user", "sub": "who wrote it?", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "template", "to": "visitor", "label": "loves problems" },
      { "kind": "say", "at": 1.4, "actor": "visitor", "text": "could be anyone", "tone": "warn" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "specific", "to": "visitor", "label": "number, mistake" },
      { "kind": "say", "at": 3.7, "actor": "visitor", "text": "believes it", "tone": "good" },
      { "kind": "verdict", "at": 4.4, "text": "Specifics make a site yours", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The specific page was not better written. It had things only its author could have put there.
