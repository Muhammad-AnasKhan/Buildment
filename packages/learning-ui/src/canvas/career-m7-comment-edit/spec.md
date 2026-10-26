---
artifact: canvas-spec
course: career-brand
chapter: "7.3"
beat: 4
slug: career-m7-comment-edit
kind: phrase-fixer
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: A comment that adds one thing

## Teaching claim
A good comment adds one useful thing: a small true example, a number or a question that shows you read the post. "Great post!" and a pitch add nothing. A comment is not a way to be seen.

## Why this visual
The phrase fixer shows a draft comment as it would appear under a post. Tapping the parts that add nothing turns it into the comment Areej would write.

## Change from the module brief
The brief imagines rating five draft comments in a sorter. Module 7 already uses a sorter in 7.4, so this beat uses the phrase fixer on one draft: the same lesson, one comment improved in place. The fix uses Areej's own work (the index bullet) as the small example.

## Data
Areej's example is from the canon: a composite index cut a report's p95 from 4.6 s to 0.41 s (14 days before and after). LinkedIn suggests building reputation by reacting and commenting and asks members to respond authentically (checked 2026-10).

```json
{
  "title": "A comment that adds one thing",
  "purpose": "Tap the parts of a draft comment that add nothing: a generic thanks and a pitch. Each says why and gives what Areej would write. The card then becomes her comment.",
  "limits": "This is a course method with LinkedIn's own advice behind it, not a promise of replies. A comment must be written by you; never use a tool that comments for you, which the rules forbid. Checked 2026-10.",
  "config": {
    "segments": [
      { "id": "great", "text": "Great post! Thanks for sharing.", "weak": { "why": "Adds nothing. Anyone could write it.", "fix": "On the index point: a composite index cut a report's p95 from 4.6 s to 0.41 s for me (14 days before and after)." } },
      { "id": "question", "text": "Did you test on data of the same size?", "fineWhy": "A question that shows you read the post." },
      { "id": "pitch", "text": "Check out my services!", "weak": { "why": "A pitch, not a contribution.", "fix": "Happy to share the query plan if useful." } }
    ],
    "cardLabel": "A draft comment",
    "checkableBefore": 0,
    "hint": "Tap each part that adds nothing for the author or the readers.",
    "endNote": "Now the comment adds a small true example, keeps a question that shows she read the post, and offers help instead of a pitch."
  }
}
```

## What the learner should notice
The question was already good and stays. The two weak parts were polite but empty, and each was replaced by something only this writer could add.
