---
artifact: canvas-spec
course: career-brand
chapter: "6.2"
beat: 4
slug: career-m6-filing-cabinet
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: What tracking software really does

## Teaching claim
Applicant tracking software is a filing cabinet that sorts and filters by rules a person set. A person makes the decision. The story that most resumes are thrown out by a robot has no source.

## Why this visual
Three steps in order: the employer sets the rules, the software sorts, a person decides.

## Data
The "75 percent are rejected by robots" figure traces to a 2012 sales pitch by a company that closed in 2013, with no study. A major vendor says it never uses AI to rate candidates or auto-reject (a blog post dated 2025-01-08). An employer survey reports that more than 90 percent of employers using recruitment software use it for a first cut or ranking, sometimes with negative filters such as a long gap in work; it surveys firms that use such software, not a two-person startup reading an inbox.

```json
{
  "title": "What tracking software really does",
  "purpose": "An employer sets filters in a tracking tool. The tool sorts the applications into a list. A person looks at the list and decides. The software files and filters; people set the rules and make the decisions.",
  "limits": "Some employers do use filters, including negative ones, and the survey covers firms that use such software. A small team reading an inbox may not use any. Vendor statements are the vendor's own. Checked 2026-10.",
  "hint": "Rules set by people, decisions by people.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "employer", "label": "Employer", "kind": "user", "sub": "sets the rules", "x": 62, "y": 110 },
      { "id": "tool", "label": "The tool", "kind": "server", "sub": "sorts, filters", "x": 358, "y": 110 },
      { "id": "person", "label": "A person", "kind": "user", "sub": "reads the list", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "employer", "to": "tool", "label": "sets filters" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "tool", "to": "person", "label": "sorted list" },
      { "kind": "say", "at": 2.8, "actor": "person", "text": "makes the call", "tone": "good" },
      { "kind": "verdict", "at": 3.5, "text": "People set the rules and decide", "tone": "good" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
The tool never decides. That is why a plain, readable file and a clear first line still matter to a person at the end.
