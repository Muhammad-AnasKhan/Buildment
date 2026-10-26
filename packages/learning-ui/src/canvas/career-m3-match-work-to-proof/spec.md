---
artifact: canvas-spec
course: career-brand
chapter: "3.3"
beat: 2
slug: career-m3-match-work-to-proof
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Match the work to its proof

## Teaching claim
Every kind of work leaves a different trace. A query fix leaves plans and charts, a cleanup leaves a pull request and tests, a migration leaves row counts. For a security fix the proof is the fix, never the secret.

## Why this visual
The sorter asks for a match per card and answers a wrong match with the right kind of trace, so the learner meets the map in use.

## Data
Eight work items, three kinds of proof. Examples come from the sponsor's list of sources. Plain checks: a plan pair and a latency chart for the query; the pull request and test run before and after for the cleanup; the revocation and the push protection setting for the key; row counts and error counts for the migration; a timing sheet for the automation; the service dashboard for uptime; database counts or analytics for users; the bill or cost report for cost.

```json
{
  "title": "Match the work to its proof",
  "purpose": "Sort eight kinds of work into the kind of proof each one leaves: charts and plans, code and settings, or counts and sheets, with a short reason after each wrong try.",
  "limits": "Real work often leaves more than one trace. Each card shows the trace this course asks you to keep first. Cost and uptime figures need a stated period and source.",
  "config": {
    "buckets": [
      { "id": "charts", "label": "Charts, plans", "sub": "dashboards, bills" },
      { "id": "code", "label": "Code, settings", "sub": "pull requests, tests" },
      { "id": "counts", "label": "Counts, sheets", "sub": "rows, minutes, users" }
    ],
    "cards": [
      { "id": "query", "text": "Fixed a slow database query", "answer": "charts", "why": { "code": "A query fix shows in plans and latency.", "counts": "Counts do not show speed. A plan pair does." } },
      { "id": "cleanup", "text": "Cleaned up a messy module", "answer": "code", "why": { "charts": "Cleanup shows in the pull request and tests.", "counts": "A cleanup has no rows or minutes to count." } },
      { "id": "key", "text": "Fixed a leaked key", "answer": "code", "why": { "charts": "Show the revocation and the setting, not a chart.", "counts": "There is nothing to count. Show the fix." } },
      { "id": "migration", "text": "Moved old data into a new database", "answer": "counts", "why": { "charts": "Row counts before and after prove a migration.", "code": "Code shows how, not that every row arrived." } },
      { "id": "automation", "text": "Automated a task people did by hand", "answer": "counts", "why": { "charts": "A timing sheet shows minutes before and after.", "code": "The script alone does not show time saved." } },
      { "id": "uptime", "text": "Kept a service running", "answer": "charts", "why": { "code": "Uptime shows on the service dashboard.", "counts": "User counts do not show uptime." } },
      { "id": "users", "text": "Handled more users", "answer": "counts", "why": { "charts": "User counts come from the database or analytics.", "code": "Code does not show how many users came." } },
      { "id": "bill", "text": "Cut a cloud bill", "answer": "charts", "why": { "code": "The bill or cost report shows the cut.", "counts": "Use the bill, for one stated period." } }
    ],
    "deckLabel": "Kind of work",
    "prompt": "What would prove this work?",
    "hint": "Tap the kind of proof, or drag the card onto it.",
    "endNote": "Different work leaves different traces. For a security fix, show the fix and never the secret."
  }
}
```

## What the learner should notice
No card asks for a new number. The proof already exists somewhere, and the job is to name where.
