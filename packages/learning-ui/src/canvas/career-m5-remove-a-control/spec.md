---
artifact: canvas-spec
course: career-brand
chapter: "5.3"
beat: 4
slug: career-m5-remove-a-control
kind: sorter
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Remove a control, see the risk

## Teaching claim
A demo login is a door that strangers will push on. Each of four controls (fake data, low rights, limits with a reset, and no real keys in the repository) stops a different thing.

## Why this visual
The brief imagines switching a control off and watching what a stranger could do. The sorter turns it round: each card is something a stranger could do, and the learner names the control that prevents it. The learner sees the same pairs from the other side.

## Data
The controls are the demo checklist from the brief (course method from the OWASP cheat sheets, checked 2026-10): seeded fake data with no real person's information; low rights that cannot reach real email, SMS, payments or paid APIs; spending and rate limits and a scheduled reset; no real keys in the repository, only an example env file; and a visible "this is a demo" line (not a bucket; it is a reminder in the end note).

```json
{
  "title": "Remove a control, see the risk",
  "purpose": "Sort eight things a stranger could do to a demo into the control that prevents each: fake data, low rights, limits and a reset, or keys kept out of the repository.",
  "limits": "A short checklist, not a full security review. Real demos also need a limit on repeated password guesses and a visible 'this is a demo' line. Checked 2026-10; trust the current OWASP guidance over any list.",
  "config": {
    "buckets": [
      { "id": "fake", "label": "Fake data", "sub": "no real person's data" },
      { "id": "rights", "label": "Low rights", "sub": "cannot reach email or pay" },
      { "id": "limits", "label": "Limits and reset", "sub": "rate limits, nightly reset" },
      { "id": "keys", "label": "Keys out of repo", "sub": "example env file only" }
    ],
    "cards": [
      { "id": "customer-email", "text": "A stranger opens the demo and sees a real customer's email", "answer": "fake", "why": { "rights": "Rights do not hide data that is really there.", "limits": "A reset does not hide data that was there.", "keys": "Keys do not change what the data is." } },
      { "id": "send-email", "text": "A stranger uses the demo account to send real emails", "answer": "rights", "why": { "fake": "Fake data does not stop a real email service.", "limits": "A limit only slows it. The fix is no access.", "keys": "The problem is what the account can reach." } },
      { "id": "paid-api", "text": "A stranger calls a paid API thousands of times", "answer": "limits", "why": { "fake": "Fake data does not cap the spending.", "rights": "Rights help, but a limit caps the spending.", "keys": "Keys are not the issue. The volume is." } },
      { "id": "junk", "text": "A stranger fills the demo with junk and leaves it broken", "answer": "limits", "why": { "fake": "Fake data can still be broken.", "rights": "Low rights do not undo junk data.", "keys": "Keys are not the issue. The data is." } },
      { "id": "live-key", "text": "A reader finds a live key in the repository", "answer": "keys", "why": { "fake": "The data is fake. The key is real.", "rights": "Low rights do not hide a key in the code.", "limits": "A reset does not remove a key from history." } },
      { "id": "payments", "text": "A stranger reaches real payments from the demo account", "answer": "rights", "why": { "fake": "Fake data does not block a real payment route.", "limits": "A limit slows it. Low rights block it.", "keys": "The route, not a key, is the problem." } },
      { "id": "real-sales", "text": "The demo shows a real shop's sales", "answer": "fake", "why": { "rights": "Low rights do not make real data fake.", "limits": "A reset does not make real data fake.", "keys": "Keys do not change what the data is." } },
      { "id": "old-commit", "text": "An old commit still holds a real key", "answer": "keys", "why": { "fake": "Fake data does not remove an old key.", "rights": "Low rights do not clean the history.", "limits": "A reset does not clean the history." } }
    ],
    "deckLabel": "What a stranger could do",
    "prompt": "Which control stops this?",
    "hint": "Tap the control that prevents this, or drag the card onto it.",
    "endNote": "A demo login is a door strangers will push on. Give it fake data, small rights, limits with a reset, and no real keys. Add a visible 'this is a demo' line."
  }
}
```

## What the learner should notice
Each control stops one kind of harm and no other. Leaving one out leaves that harm open.
