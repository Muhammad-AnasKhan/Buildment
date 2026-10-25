import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.4 beat 3: p50, p95 and p99 in plain words.
// Line up 100 requests from fastest to slowest. p50 is the middle one. p95 is the point where 1 request in 20 was slower. p99 is the point where 1 in 100 was slower.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3PercentileLine: SceneSpec = {
  "kind": "scene",
  "title": "p50, p95 and p99 in plain words",
  "purpose": "One hundred requests are lined up from fastest to slowest. Three markers show p50, the middle one, p95, where 1 in 20 was slower, and p99, where 1 in 100 was slower.",
  "limits": "A simplified picture: real dashboards use thousands of requests and a method for choosing the exact point. Track failed and successful requests separately, because a fast error flatters the numbers.",
  "hint": "Three markers on one line.",
  "scene": {
    "width": 420,
    "height": 320,
    "actors": [
      {
        "id": "requests",
        "label": "Requests",
        "kind": "queue",
        "sub": "100, sorted",
        "x": 62,
        "y": 110
      },
      {
        "id": "you",
        "label": "You",
        "kind": "user",
        "sub": "reads the line",
        "x": 358,
        "y": 110
      }
    ],
    "strip": {
      "y": 275,
      "from": 0,
      "to": 100,
      "unit": "%",
      "caption": "100 requests, fastest to slowest",
      "every": 25
    },
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "requests",
        "to": "you",
        "label": "sorted by time"
      },
      {
        "kind": "tag",
        "at": 1.6,
        "row": 0,
        "value": 50,
        "label": "p50: middle",
        "tone": "accent"
      },
      {
        "kind": "tag",
        "at": 2.6,
        "row": 1,
        "value": 95,
        "label": "p95: 1 in 20",
        "tone": "warn"
      },
      {
        "kind": "tag",
        "at": 3.6,
        "row": 0,
        "value": 99,
        "label": "p99: 1 in 100",
        "tone": "bad"
      },
      {
        "kind": "verdict",
        "at": 4.4,
        "text": "p95 means 1 in 20 was slower",
        "tone": "accent"
      }
    ],
    "loop": 8
  }
};
