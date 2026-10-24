---
artifact: canvas-spec
course: multi-vendor-marketplace
chapter: 20.10-vendor-update-status
slug: freshmarket-order-status
version: 1
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: FreshMarket order status

## Teaching claim

The vendor status route is a state machine: each status has exactly one allowed next status, and the server refuses everything else, a skipped step and a backwards step with 400 and a request based on an old status with 409.

## Why a canvas

The chapter gives the rules as three tables (moves, status codes, UI actions). Stepping through one order, and seeing the refused requests as loops that leave the state unchanged, joins those tables into one picture.

## Model

- States: pending, packed, dispatched (final).
- Allowed moves: pending to packed, packed to dispatched.
- Refused: a skipped step (400), a stale expected status (409), a backwards move from dispatched (400).
- No inputs beyond the step controls. Five steps.

## Rendering

- Inline SVG, two fixed layouts: left to right from `sm` up, top to bottom on phones.
- Refused requests are dashed loops with the status code in the label, so colour is never the only signal.
- Static fallback: the tables in chapter 20.10.

## Status

Registered, not yet used in a chapter. Chapter 20.10 is the natural home, right after "Server rules: spec".

## Limits

Leaves out 403 (another vendor's order), 404 (missing order) and customer actions such as cancelling.
