---
artifact: canvas-spec
course: career-brand
chapter: "5.2"
beat: 2
slug: career-m5-same-box
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A deployable unit runs the same anywhere

## Teaching claim
A container is an isolated process with everything it needs, so it should behave the same on a laptop and on a server. Your README then needs one start command, not a list of setup steps.

## Why this visual
One box moves from a laptop to a cloud server unchanged, and the README holds one command.

## Data
Based on Docker's own description of a container (checked 2026-10). The course asks for a one-command start written in the README, not deep container skills.

```json
{
  "title": "A deployable unit runs the same anywhere",
  "purpose": "The same container, built on a laptop, runs on a cloud server without changes. The README carries one command to start it.",
  "limits": "A simplified picture. Containers need a runtime on each machine and are not a promise that nothing can differ. The course asks only for a one-command start in the README. Checked 2026-10.",
  "hint": "The same box, two places.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "laptop", "label": "Laptop", "kind": "server", "sub": "builds the box", "x": 62, "y": 110 },
      { "id": "cloud", "label": "Cloud", "kind": "server", "sub": "runs the box", "x": 358, "y": 110 },
      { "id": "readme", "label": "README", "kind": "note", "sub": "one command", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.2, "from": "laptop", "to": "cloud", "label": "the same box" },
      { "kind": "say", "at": 1.7, "actor": "cloud", "text": "runs the same", "tone": "good" },
      { "kind": "say", "at": 2.4, "actor": "readme", "text": "start: one line", "tone": "accent" },
      { "kind": "verdict", "at": 3.2, "text": "The same box runs anywhere", "tone": "good" }
    ],
    "loop": 7
  }
}
```

## What the learner should notice
Nothing was reinstalled on the server. The reader only needs the single start line in the README.
