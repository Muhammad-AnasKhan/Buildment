import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.5 beat 3: A query plan pair.
// A query plan pair, a sequential scan then an index scan, with the real timings, is proof for a database fix. Quote the actual times, not the cost units.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3PlanPair: SceneSpec = {
  "kind": "scene",
  "title": "A query plan pair",
  "purpose": "Areej runs the slow query on a staging copy and the plan shows a sequential scan with an actual time of 3,840 ms. After the index it shows an index scan with an actual time of 46 ms.",
  "limits": "Areej is a fictional fellow and her numbers are illustrative. EXPLAIN shows the planner's chosen plan with estimated cost; EXPLAIN ANALYZE runs the query, so wrap writes in a transaction and roll back. Cost units are arbitrary and not milliseconds. Checked 2026-10 (PostgreSQL 18 documentation).",
  "hint": "Two timings on one strip.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "areej",
        "label": "Areej",
        "kind": "user",
        "sub": "EXPLAIN ANALYZE",
        "x": 62,
        "y": 110
      },
      {
        "id": "db",
        "label": "Staging copy",
        "kind": "database",
        "sub": "same data size",
        "x": 358,
        "y": 110
      }
    ],
    "strip": {
      "y": 285,
      "from": 0,
      "to": 4000,
      "unit": "ms",
      "caption": "actual time of the query",
      "every": 1000
    },
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "areej",
        "to": "db",
        "label": "run the query"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "db",
        "text": "sequential scan",
        "tone": "bad"
      },
      {
        "kind": "tag",
        "at": 1.6,
        "row": 0,
        "value": 3840,
        "label": "before: 3,840 ms",
        "tone": "bad"
      },
      {
        "kind": "fly",
        "at": 3,
        "dur": 1,
        "from": "areej",
        "to": "db",
        "label": "add the index"
      },
      {
        "kind": "say",
        "at": 4.1,
        "actor": "db",
        "text": "index scan",
        "tone": "good"
      },
      {
        "kind": "tag",
        "at": 4.3,
        "row": 1,
        "value": 46,
        "label": "after: 46 ms",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 5,
        "text": "Same query: 3,840 ms to 46 ms",
        "tone": "good"
      }
    ],
    "loop": 9
  }
};
