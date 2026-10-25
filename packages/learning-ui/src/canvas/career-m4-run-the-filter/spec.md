---
artifact: canvas-spec
course: career-brand
chapter: "4.3"
beat: 4
slug: career-m4-run-the-filter
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Run five ideas through the filter

## Teaching claim
An idea passes the four-question filter when it is useful to one person or a small known group on day one, has a result you can measure, has depth you can explain in writing, and does not need two sides at once.

## Why this visual
The sorter makes the learner put each idea in the bin that matches the first question it fails. The reasons name the gap.

## Change from the module brief
The brief gives five ideas and four gates. A sorter holds up to eight cards and four buckets, so the data uses eight ideas and three outcomes: passes all four, needs two sides, not measurable (no user, no result). Each of the brief's five ideas is included. The "community cloud" is one illustrative idea under the standard definition, not the sponsor's project, and it does not describe the sponsor's website.

## Data
```json
{
  "title": "Run five ideas through the filter",
  "purpose": "Sort eight project ideas by what the four-question filter says: passes all four, needs two sides at once, or has nothing to measure. A short reason follows each wrong try.",
  "limits": "The filter is this course's method, not a law. One idea is only an example: a community cloud, in the standard definition, is infrastructure shared by a group with a common purpose. It passes only if it starts with a defined small group, a real workload and a measurable result.",
  "config": {
    "buckets": [
      { "id": "passes", "label": "Passes all four", "sub": "build or write it" },
      { "id": "two-sided", "label": "Needs two sides", "sub": "both must show up" },
      { "id": "unmeasurable", "label": "Not measurable", "sub": "no user, no result" }
    ],
    "cards": [
      { "id": "ride", "text": "A ride-sharing app for the whole city", "answer": "two-sided", "why": { "passes": "It needs drivers and riders at the same time.", "unmeasurable": "It can be measured. The trouble is two sides." } },
      { "id": "community-cloud", "text": "A community cloud for a defined small group with a real workload", "answer": "passes", "why": { "two-sided": "It starts with one defined group, not two sides.", "unmeasurable": "Jobs run and hours used can be counted." } },
      { "id": "shortener", "text": "A URL shortener studied in depth and written up with load tests", "answer": "passes", "why": { "two-sided": "It needs no second side. The reader is you.", "unmeasurable": "Load tests give numbers, and the write-up shows depth." } },
      { "id": "clone", "text": "A clone of a famous social app, built in a weekend", "answer": "unmeasurable", "why": { "passes": "It has no real user and nothing to measure.", "two-sided": "The trouble is no user and no result." } },
      { "id": "docs-fix", "text": "A small documentation fix in an open source library", "answer": "passes", "why": { "two-sided": "A maintainer can merge it alone.", "unmeasurable": "A merged change is a result you can show." } },
      { "id": "marketplace", "text": "A marketplace for freelancers, with no sellers yet", "answer": "two-sided", "why": { "passes": "Buyers need sellers and sellers need buyers.", "unmeasurable": "The trouble is two sides, not the numbers." } },
      { "id": "todo", "text": "A to-do app like the hundred others online", "answer": "unmeasurable", "why": { "passes": "No one needs it, and nothing is measured.", "two-sided": "It has one side. The trouble is no result." } },
      { "id": "stock", "text": "A stock tool for one print shop, counting stockouts per month", "answer": "passes", "why": { "two-sided": "One shop owner is the user on day one.", "unmeasurable": "Stockouts per month is a clear number." } }
    ],
    "deckLabel": "Project idea",
    "prompt": "Which question does this idea fail?",
    "hint": "Tap the bucket this idea belongs in, or drag the card onto it.",
    "endNote": "Pick ideas that are useful to one known person or group, measurable, and deep enough to write about. Avoid ideas that need two sides at once."
  }
}
```

## What the learner should notice
Three of the ideas pass for different reasons: a real small group, depth in writing, and a result a maintainer can merge. Two sides and "nothing to measure" are the two common failures.
