import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.1 beat 2: The same week, bigger machines.
// Tawfiq's pipeline went from 5 hours to 1.5 hours the same week the platform team moved it to larger machines. Only his own join step, 50 to 20 minutes in the job logs, is his to claim.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3SameWeek: SceneSpec = {
  "kind": "scene",
  "title": "The same week, bigger machines",
  "purpose": "The nightly run falls from 5 hours to 1.5 hours the week the platform team moves it to larger machines. Tawfiq's own join step falls from 50 to 20 minutes, which the job logs show.",
  "limits": "Tawfiq, his team and the numbers are fictional and illustrative. 5 hours to 1.5 hours is a 70 percent cut of the whole run, on one night.",
  "hint": "Two changes, one week.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "machines",
        "label": "New machines",
        "kind": "server",
        "sub": "same week",
        "x": 62,
        "y": 110
      },
      {
        "id": "tawfiq",
        "label": "Tawfiq",
        "kind": "user",
        "sub": "join step",
        "x": 358,
        "y": 110
      },
      {
        "id": "run",
        "label": "Nightly run",
        "kind": "worker",
        "sub": "5 h",
        "x": 62,
        "y": 250
      },
      {
        "id": "logs",
        "label": "Job logs",
        "kind": "note",
        "sub": "his step only",
        "x": 358,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "machines",
        "to": "run",
        "label": "bigger machines"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "run",
        "text": "5 h to 1.5 h",
        "tone": "accent"
      },
      {
        "kind": "fly",
        "at": 2.4,
        "dur": 1,
        "from": "tawfiq",
        "to": "logs",
        "label": "his join step"
      },
      {
        "kind": "say",
        "at": 3.5,
        "actor": "logs",
        "text": "50 to 20 min",
        "tone": "good"
      },
      {
        "kind": "mark",
        "at": 3.5,
        "actor": "logs",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.3,
        "text": "Part of the 70 percent was not his",
        "tone": "warn"
      }
    ],
    "loop": 8
  }
};
