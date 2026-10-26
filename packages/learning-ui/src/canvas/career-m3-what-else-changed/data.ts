import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.2 beat 4: What else changed in the window.
// A single before and after cannot separate your change from everything else that changed in the same weeks. Name what else changed, and show what you checked.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3WhatElseChanged: SceneSpec = {
  "kind": "scene",
  "title": "What else changed in the window",
  "purpose": "Areej's window runs through May. The index ships on 15 May. A front-end release lands on 20 May. Her card lists the release and the request counts, 6,300 before and 6,100 after, so traffic does not explain the change.",
  "limits": "A before and after of this kind is a weak design, so the card says what else changed rather than hiding it. A comparison you control (chapter 3.5) is stronger.",
  "hint": "Two other things happened in the window.",
  "scene": {
    "width": 420,
    "height": 320,
    "actors": [
      {
        "id": "areej",
        "label": "Areej",
        "kind": "user",
        "sub": "writes the card",
        "x": 62,
        "y": 110
      },
      {
        "id": "card",
        "label": "Claim card",
        "kind": "note",
        "sub": "other changes",
        "x": 358,
        "y": 110
      }
    ],
    "strip": {
      "y": 275,
      "from": 1,
      "to": 29,
      "unit": "May",
      "caption": "days in May 2025",
      "every": 7
    },
    "events": [
      {
        "kind": "tag",
        "at": 0.3,
        "row": 0,
        "value": 15,
        "label": "15 May: index",
        "tone": "accent"
      },
      {
        "kind": "tag",
        "at": 1.3,
        "row": 1,
        "value": 20,
        "label": "20 May: release",
        "tone": "warn"
      },
      {
        "kind": "fly",
        "at": 2.2,
        "dur": 1,
        "from": "areej",
        "to": "card",
        "label": "list the release"
      },
      {
        "kind": "say",
        "at": 3.3,
        "actor": "card",
        "text": "6,300 vs 6,100",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4,
        "text": "Name what else changed",
        "tone": "good"
      }
    ],
    "loop": 8
  }
};
