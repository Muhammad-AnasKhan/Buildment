---
artifact: canvas-spec
course: multi-vendor-marketplace
chapter: 20.10-vendor-update-status
slug: freshmarket-mark-packed
version: 1
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Mark packed, from two tabs

## Teaching claim

The conditional update (this order, this store, and the status the page expected) is what turns a click from a stale tab into a 409 instead of a silent overwrite.

## Why a canvas

The chapter states the rule in one paragraph. Following the same request twice, once from a fresh tab and once from a stale one, shows that the requests are identical and only the database state differs, which is the point.

## Model

- Lanes: Vendor tab, Old tab, API, Database.
- Steps: PATCH, check store and move, conditional update, saved order, 200; then the stale PATCH, the same update matching nothing, 409.
- No inputs beyond the step controls. Eight steps.

## Rendering

- Inline SVG, two fixed layouts (phone and `sm` up), chosen by CSS.
- The current arrow carries a short moving highlight (CSS only); with reduced motion a still dot marks it instead.
- Static fallback: the "Server rules: spec" section of chapter 20.10.

## Status

Registered, not yet used in a chapter. Chapter 20.10, after the PATCH contract, is the natural home.

## Limits

Leaves out 403 and 404, and shows the two tabs one after the other although their requests can arrive in either order.
