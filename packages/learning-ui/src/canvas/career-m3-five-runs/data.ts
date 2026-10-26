import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.5 beat 4: One audit run can mislead.
// A page audit score varies from run to run. One run is weak proof. Run it several times and use the median; a median of five is about twice as stable as one run.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3FiveRuns: SceneSpec = {
  "kind": "scene",
  "title": "One audit run can mislead",
  "purpose": "The same page is audited five times. The scores scatter from 88 to 98. The median of the five is 93. One run on its own would have said 88 or 98.",
  "limits": "The scores are made up to show the spread. Lighthouse results vary with network, hardware and the page itself; its documentation recommends several runs and the median. A good lab score is not proof the site is fast for real users. Checked 2026-10.",
  "hint": "Five runs of the same page.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "audit",
        "label": "Page audit",
        "kind": "worker",
        "sub": "same page",
        "x": 62,
        "y": 110
      },
      {
        "id": "you",
        "label": "You",
        "kind": "user",
        "sub": "runs it 5 times",
        "x": 358,
        "y": 110
      }
    ],
    "strip": {
      "y": 285,
      "from": 85,
      "to": 100,
      "unit": "pts",
      "caption": "audit score, five runs",
      "every": 5
    },
    "events": [
      {
        "kind": "tag",
        "at": 0.5,
        "row": 1,
        "value": 91,
        "label": "run 1: 91",
        "tone": "accent"
      },
      {
        "kind": "tag",
        "at": 1.2,
        "row": 1,
        "value": 96,
        "label": "run 2: 96",
        "tone": "accent"
      },
      {
        "kind": "tag",
        "at": 1.9,
        "row": 0,
        "value": 88,
        "label": "run 3: 88",
        "tone": "accent"
      },
      {
        "kind": "tag",
        "at": 2.6,
        "row": 0,
        "value": 98,
        "label": "run 4: 98",
        "tone": "accent"
      },
      {
        "kind": "tag",
        "at": 3.3,
        "row": 0,
        "value": 93,
        "label": "run 5: 93",
        "tone": "accent"
      },
      {
        "kind": "line",
        "at": 4.1,
        "value": 93,
        "label": "median 93"
      },
      {
        "kind": "verdict",
        "at": 4.8,
        "text": "One run is weak proof; use the median",
        "tone": "warn"
      }
    ],
    "loop": 8.5
  }
};
