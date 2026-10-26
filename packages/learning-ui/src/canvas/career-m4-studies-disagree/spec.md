---
artifact: canvas-spec
course: career-brand
chapter: "4.2"
beat: 1
slug: career-m4-studies-disagree
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Studies of AI coding tools disagree

## Teaching claim
Studies of AI coding tools disagree because they measure different tasks, people and tools. Do not promise a speed number. Promise a record of what you checked.

## Why this visual
Four study cards each say something different. Putting them side by side shows the disagreement, and the verdict says what to do about it.

## Data
The four cards show direction only, no figures, because the course never teaches an AI speed multiple as fact. The fold gives the sourced detail: one small task (an HTTP server) finished faster with the tool; three company field experiments completed more tasks, with larger gains for less experienced developers; sixteen experienced developers on their own repositories took longer with early-2025 tools while believing they were faster; a late-2025 follow-up called its own data very weak evidence. Do not quote the follow-up's numbers.

```json
{
  "title": "Studies of AI coding tools disagree",
  "purpose": "Four studies of AI coding tools are shown side by side: faster on one small task, more tasks done in company trials, slower for experienced developers on their own code, and a follow-up too weak to size.",
  "limits": "Direction only, by design. The studies differ in tasks, people and tools, and the tools change quickly. Nothing here is a promise about how fast you will work with AI.",
  "hint": "Four studies, four answers.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "small", "label": "Small task", "kind": "note", "sub": "one study", "x": 62, "y": 110 },
      { "id": "trials", "label": "Field trials", "kind": "note", "sub": "three firms", "x": 358, "y": 110 },
      { "id": "own", "label": "Own repos", "kind": "note", "sub": "experienced", "x": 62, "y": 240 },
      { "id": "followup", "label": "Follow-up", "kind": "note", "sub": "later study", "x": 358, "y": 240 }
    ],
    "events": [
      { "kind": "say", "at": 0.8, "actor": "small", "text": "faster", "tone": "good" },
      { "kind": "say", "at": 1.8, "actor": "trials", "text": "more tasks", "tone": "good" },
      { "kind": "say", "at": 2.8, "actor": "own", "text": "took longer", "tone": "bad" },
      { "kind": "say", "at": 3.8, "actor": "followup", "text": "too weak to use", "tone": "warn" },
      { "kind": "verdict", "at": 4.8, "text": "Studies disagree. No speed promise.", "tone": "warn" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
There is no single answer to "how much faster". The honest thing to promise is a log of what you asked, used and checked.
