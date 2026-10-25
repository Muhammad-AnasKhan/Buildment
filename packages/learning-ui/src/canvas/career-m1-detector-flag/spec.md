---
artifact: canvas-spec
course: career-brand
chapter: "1.4"
beat: 4
slug: career-m1-detector-flag
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Detectors flag second-language English

## Teaching claim
AI detectors often wrongly flag English written by non-native speakers. If a screen says "AI" about your plain English, that is a known weakness of the tools, not a verdict on you.

## Why this visual
Two essays go through one detector. The careful second-language essay is stamped "AI?" and the other passes. The error sits with the tool.

## Data
```json
{
  "title": "Detectors flag second-language English",
  "purpose": "A detector scans a careful essay written in a second language and stamps it as AI. It passes another essay without a question. The tool is wrong, not the writer.",
  "limits": "Two essays are a story. Several widely used detectors misclassified more than half of essays by non-native speakers as AI-generated, while classifying US eighth-grade essays accurately. Do not quote a single percentage. If a screen says AI, offer your working document, your drafts and the evidence behind each claim.",
  "hint": "Watch what the detector does with each essay.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "detector", "label": "Detector", "kind": "worker", "sub": "stamps AI", "x": 210, "y": 105 },
      { "id": "careful", "label": "Careful essay", "kind": "note", "sub": "second language", "x": 62, "y": 250 },
      { "id": "other", "label": "Other essay", "kind": "note", "sub": "first language", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "careful", "to": "detector", "label": "scan" },
      { "kind": "say", "at": 1.4, "actor": "detector", "text": "stamps: AI?", "tone": "bad" },
      { "kind": "say", "at": 1.9, "actor": "careful", "text": "written by me", "tone": "good" },
      { "kind": "fly", "at": 3.0, "dur": 1.0, "from": "other", "to": "detector", "label": "scan" },
      { "kind": "say", "at": 4.1, "actor": "detector", "text": "passes", "tone": "accent" },
      { "kind": "verdict", "at": 4.8, "text": "The tool is wrong, not the writer", "tone": "warn" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
Making plain English sound less like English is not the fix. Showing the evidence behind each claim is.

## Limits
In the `limits` field of the data.
