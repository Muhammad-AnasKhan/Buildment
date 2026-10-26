---
artifact: canvas-spec
course: career-brand
chapter: "3.5"
beat: 2
slug: career-m3-k6-fair-test
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Same script, same data, same machine

## Teaching claim
Areej can say the cache did it because everything else stayed fixed: the same script, the same seeded data, the same laptop. Only the cache changed.

## Why this visual
The same test meets the API twice. The threshold fails the first time and passes the second, and three of the four boxes never change.

## Data
Numbers are the canon's: constant arrival rate of 50 requests per second for 2 minutes, a seeded database of 10,000 events, the same laptop, threshold `p(95)<200` on `http_req_duration`. Before: p95 820 ms, threshold fails. After a 30-second cache: p95 95 ms, threshold passes. Error rate under 1 percent in both runs.

```json
{
  "title": "Same script, same data, same machine",
  "purpose": "Areej runs one load test twice against the events list. Before the cache the 95th percentile is 820 ms and the 200 ms threshold fails. After a 30-second cache it is 95 ms and the threshold passes. The script, data and laptop do not change.",
  "limits": "This is a laptop test, not production, and cached lists can be up to 30 seconds old. The test uses an open model with a constant arrival rate, so it does not ease off when the server slows. Checked 2026-10; check the k6 documentation for the current syntax.",
  "hint": "Only one box changes.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "test", "label": "Load test", "kind": "worker", "sub": "50 req/s, 2 min", "x": 62, "y": 105 },
      { "id": "api", "label": "Events API", "kind": "server", "sub": "no cache", "x": 358, "y": 105 },
      { "id": "data", "label": "Demo data", "kind": "database", "sub": "10,000 events", "x": 62, "y": 250 },
      { "id": "result", "label": "Threshold", "kind": "note", "sub": "p95 under 200", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "test", "to": "api", "label": "50 per second" },
      { "kind": "say", "at": 1.4, "actor": "api", "text": "p95 820 ms", "tone": "bad" },
      { "kind": "say", "at": 1.7, "actor": "result", "text": "fails", "tone": "bad" },
      { "kind": "say", "at": 2.8, "actor": "api", "text": "30 s cache", "tone": "accent" },
      { "kind": "mark", "at": 2.8, "actor": "data", "tone": "accent" },
      { "kind": "fly", "at": 3.4, "dur": 1.0, "from": "test", "to": "api", "label": "same script" },
      { "kind": "say", "at": 4.5, "actor": "api", "text": "p95 95 ms", "tone": "good" },
      { "kind": "say", "at": 4.8, "actor": "result", "text": "passes", "tone": "good" },
      { "kind": "verdict", "at": 5.4, "text": "Only the cache changed", "tone": "good" }
    ],
    "loop": 9
  }
}
```

## What the learner should notice
The test, the data and the machine are drawn once and never move. That is what lets the one change speak.
