---
artifact: canvas-spec
course: career-brand
chapter: "3.4"
beat: 5
slug: career-m3-percentiles-dont-average
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Percentiles do not average

## Teaching claim
Averaging each server's p99 gives a number no request had. The right way is to merge the requests (or add the histogram buckets) first, then read the percentile.

## Why this visual
Two servers send their own p99 to a dashboard that averages them (wrong), then send all their requests to be merged first (right). The two answers sit one after the other.

## Data
The numbers are the ones used by the reused canvas `sysdesign-m17-same-average` (two servers with 20 requests each): Server A p99 150 ms, Server B p99 810 ms; averaging gives 480 ms; the merged 40 requests have a p99 of 810 ms.

```json
{
  "title": "Percentiles do not average",
  "purpose": "A dashboard averages two servers' p99 values, 150 ms and 810 ms, and shows 480 ms. Merging the 40 requests first and then reading the p99 gives 810 ms. A fellow who sees 'average p95 across servers' should ask how it was computed.",
  "limits": "Each server has only 20 requests here, so p99 is simply the slowest request; real dashboards use thousands of requests per point. Histograms aggregate correctly because the buckets are added first.",
  "hint": "Average the p99s, then merge the requests.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "a", "label": "Server A", "kind": "server", "sub": "p99 150 ms", "x": 62, "y": 110 },
      { "id": "b", "label": "Server B", "kind": "server", "sub": "p99 810 ms", "x": 358, "y": 110 },
      { "id": "board", "label": "Dashboard", "kind": "note", "sub": "one number", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "a", "to": "board", "label": "p99 150" },
      { "kind": "fly", "at": 0.6, "dur": 1.0, "from": "b", "to": "board", "label": "p99 810" },
      { "kind": "say", "at": 1.8, "actor": "board", "text": "average: 480", "tone": "bad" },
      { "kind": "fly", "at": 3.4, "dur": 1.0, "from": "a", "to": "board", "label": "20 requests" },
      { "kind": "fly", "at": 4.6, "dur": 1.0, "from": "b", "to": "board", "label": "20 requests" },
      { "kind": "say", "at": 5.8, "actor": "board", "text": "merged p99: 810", "tone": "good" },
      { "kind": "verdict", "at": 6.4, "text": "Merge the requests, then take p99", "tone": "good" }
    ],
    "loop": 10
  }
}
```

## What the learner should notice
480 ms is a number that no request had. The true p99 is 810 ms, and the average hid a user who waited that long.
