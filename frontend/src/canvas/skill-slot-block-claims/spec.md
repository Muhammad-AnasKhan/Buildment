---
artifact: canvas-spec
course: multi-vendor-marketplace
variant: services
chapter: 15.03-block-claims-canvas
slug: skill-slot-block-claims
version: 1
owner: interaction-designer
renderer: custom (SkillSlotBlockClaimsCanvas, model.ts)
---

# SkillSlot block claims

## Teaching claim

A 60-minute service with a 15-minute buffer occupies five 15-minute UTC blocks. The provider and each block start form a unique SlotClaim key. A candidate start fails if any needed block is already claimed. The visible candidate list is advisory; a later transaction and unique index decide a real hold.

## Model and interaction

- Fixed provider window 09:00 to 11:30 UTC. Start is bounded to 09:00 through 10:15 in 15-minute steps. Occupied end is start plus 75 minutes, exclusive.
- Default existing claim at 09:45; optional existing claim at 10:30. Every grid tile reports Free, Service, Buffer, Claimed or Collision in text. The model returns the needed block starts, collisions and a fit decision.
- The start slider and two claim switches update the grid, four metrics and a live explanation. Reset restores the default collision. Try this asks the learner to predict the default, move the start outside the early claim, and test the last fitting start.
- This is a deterministic pure model. Invalid starts are rounded to the grid and clamped to the window. A complete production engine must reject off-grid input rather than round it silently.

## Rendering, accessibility and limits

- The grid uses responsive five columns on a phone and ten on a wider screen. Tiles have explicit text states in addition to theme-aware success, warning and error tones. Controls have visible labels and shared focus styles. The grid is a semantic list with an accessible title; the result sentence is announced politely.
- This canvas does not implement MongoDB claims, time-zone conversion, checkout races or payment. It teaches the block-set calculation used by both availability filtering and the later atomic claim writer. The lesson contains a static text fallback with the same five blocks.

## Acceptance checks

- Default 09:00 start needs 09:00, 09:15, 09:30, 09:45 and 10:00, and collides at 09:45.
- Moving the start to 10:00 removes the early collision; switching on 10:30 creates a later collision.
- 10:15 is the last start that fits the window including buffer. An off-grid model input cannot escape bounds or produce a fractional block.
- Pure model and reader render tests pass; the chapter's review still needs mobile, dark, keyboard and human G5 inspection before publication.
