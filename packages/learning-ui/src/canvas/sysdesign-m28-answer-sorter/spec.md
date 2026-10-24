# Canvas spec: sysdesign-m28-answer-sorter

- **Course and chapter:** system-design, module 28, chapter 28.3 beat 5, "Strong answers name a cost and a switch".
- **Renderer:** the house sorter (`primitives/sorter.tsx`, model `models/sorter.ts`) built with `makeSorterCanvas` (`primitives/canvas-factories.tsx`), like `sysdesign-m1-requirement-sorter`. All data is in `data.ts`.
- **Claim:** An answer to "why that choice?" has three levels. A claim only says what was chosen. A better answer names a cost. A strong answer gives a number and says when to switch.

## Buckets and cards

Buckets: Claim only (no cost named), Names a cost (no number), Strong (number + switch). Deck label "Candidate says". Eight cards (three claim, two cost, three strong), each wrong bucket with a reason of 60 characters or fewer. The sentences are condensed from chapters 20, 21, 24, 25 and 26.

## Inputs and what moves

Tap a bucket, or drag the card onto it. A right card flies into its bucket; a wrong card shakes and shows its reason. Bucket buttons are labelled with name, gloss and count; a live region reads each result. Numbers on screen: the three bucket counts and the end verdict.

## What the learner should notice

A number and a switch point are what lift an answer from "names a cost" to "strong"; a cost with no number is still only the middle bucket.

## Sources

Chapters 21.3, 24.1, 25.4 and 26.4 (numbers); trade-off shape from the authoring standards.
