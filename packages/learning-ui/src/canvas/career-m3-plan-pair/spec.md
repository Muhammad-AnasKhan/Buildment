---
artifact: canvas-spec
course: career-brand
chapter: "3.5"
beat: 3
slug: career-m3-plan-pair
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A query plan pair

## Teaching claim
A query plan pair, a sequential scan then an index scan, with the real timings, is proof for a database fix. Quote the actual times, not the cost units.

## Why this visual
One strip in milliseconds with the two timings on it shows the size of the gap straight away.

## Data
Numbers are the canon's: on a staging copy with the same data volume, before the index a sequential scan with an actual time of 3,840 ms; after, an index scan with an actual time of 46 ms. `EXPLAIN ANALYZE` runs the query and adds real timings. Cost units in a plan are not milliseconds.

```json
{
  "title": "A query plan pair",
  "purpose": "Areej runs the slow query on a staging copy (a private test copy) and the plan shows a sequential scan with an actual time of 3,840 ms. After the index it shows an index scan with an actual time of 46 ms.",
  "limits": "EXPLAIN shows the planner's chosen plan with estimated cost; EXPLAIN ANALYZE runs the query, so wrap writes in a transaction and roll back. Cost units are arbitrary and not milliseconds. Checked 2026-10 (PostgreSQL 18 documentation).",
  "hint": "Two timings on one strip.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "areej", "label": "Areej", "kind": "user", "sub": "reads the plan", "x": 62, "y": 110 },
      { "id": "db", "label": "Test copy", "kind": "database", "sub": "same data size", "x": 358, "y": 110 }
    ],
    "strip": { "y": 285, "from": 0, "to": 4000, "unit": "ms", "caption": "actual time of the query", "every": 1000 },
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "areej", "to": "db", "label": "run the query" },
      { "kind": "say", "at": 1.4, "actor": "db", "text": "sequential scan", "tone": "bad" },
      { "kind": "tag", "at": 1.6, "row": 0, "value": 3840, "label": "before: 3,840 ms", "tone": "bad" },
      { "kind": "fly", "at": 3.0, "dur": 1.0, "from": "areej", "to": "db", "label": "add the index" },
      { "kind": "say", "at": 4.1, "actor": "db", "text": "index scan", "tone": "good" },
      { "kind": "tag", "at": 4.3, "row": 1, "value": 46, "label": "after: 46 ms", "tone": "good" },
      { "kind": "verdict", "at": 5.0, "text": "Same query: 3,840 ms to 46 ms", "tone": "good" }
    ],
    "loop": 9
  }
}
```

## What the learner should notice
The 46 sits almost on the zero of the strip. The plan names the reason (a sequential scan became an index scan), and the time is the real one.
