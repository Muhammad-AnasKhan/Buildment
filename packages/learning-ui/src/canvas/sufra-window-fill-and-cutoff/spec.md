---
artifact: canvas-spec
course: multi-vendor-marketplace
variant: home-kitchens
chapter: 14.02-windows-cutoffs-prep-lead-and-the-server-clock
slug: sufra-window-fill-and-cutoff
version: 1
owner: interaction-designer
renderer: custom (SufraWindowFillCanvas, model.ts)
---

# Sufra window fill and cutoff

## Teaching claim

A kitchen can have capacity left while a slow dish is already closed. The dish cutoff is the earlier of the general window cutoff and the start of the window minus prep time and the travel buffer. A later order can fail for capacity even while its dish is still before cutoff. These are independent checks, both made with the server's dated clock at the claim boundary in production.

## Model

- One 13:00 window, default general cutoff 12:00, fixed 20-minute buffer.
- Maqluba defaults to 90 minutes of prep, 3 capacity units and an 11:10 cutoff. Falafel defaults to 30 minutes, 2 units and a 12:00 cutoff.
- Capacity defaults to 5 units. Four arrivals default to maqluba 11:05, maqluba 11:31, falafel 11:31 and falafel 11:45. The outcomes are accepted, past cutoff, accepted and no capacity respectively.
- General cutoff lead is 30 to 90 minutes. Prep ranges: maqluba 45 to 120, falafel 15 to 75 minutes. Loads are 1 to 6 units. Capacity is 2 to 12 units. Arrivals range from 10:30 to 12:15 in one-minute steps. A model input is clamped before simulation; at most eight arrivals are processed.
- Cutoff = `min(13:00 - generalLead, 13:00 - prep - 20)`. An arrival **at** the cutoff is rejected. Check cutoff before capacity. For equal arrival minutes, the displayed input order wins capacity first.
- Process arrivals sequentially after sorting by arrival time. Accepted loads subtract from remaining units; rejected arrivals do not. Output each status and the remaining capacity before and after.

## Interaction and rendering

- The first view states the rule, shows general and dish cutoffs, a filled-capacity metric, and two theme-aware cutoff tracks from 10:30 to 13:00.
- Six bounded sliders control capacity, general lead, each dish's prep and each dish's load. Four more sliders move arrival times. A decision timeline lists every order in actual processing order with time, dish, text status and a reason. Reset restores the chapter case.
- The "What changed" sentence names moved cutoff values, changed capacity and changed decision counts. The Try this prompts require a prediction and then a transfer: move a falafel order to exactly 12:00; raise capacity and observe that late maqluba still fails.
- Layout is one column on a phone and a two-column control grid on wider screens. Track width is fluid. Color indicates status only alongside text. Theme colors come from `TONES` and app tokens.

## Accessibility and limits

- Every slider has a visible label, live value and accessible range value. Result status and reason are text, so no meaning depends on color. The metrics update in a polite live region. The decision list uses an ordered list, not a color-only chart.
- This is a deterministic model with minute-resolution local labels. It does not convert an IANA zone, simulate DST, payment, concurrent writes, live time, kitchen closure or group orders. Later lessons test those on the server with a fake clock and atomic capacity claim. The canvas is a teaching model, not a checkout authority.

## Acceptance checks

- Default slow dish closes at 11:10 and fast dish at 12:00; an 11:31 slow arrival fails even though capacity remains after the first order.
- At the cutoff is closed; one minute before is eligible if capacity remains. Capacity rejection leaves units unchanged.
- Identical-time arrivals use stable input order. Bounds and invalid numeric input cannot produce negative capacity.
- Model tests cover default outcomes, cutoff boundary, capacity release, lead changes, tie order and clamping.
