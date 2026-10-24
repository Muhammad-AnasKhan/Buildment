# sysdesign-m14-2pc-crash (14.2, "Crash the coordinator at each step")

## What it teaches
In two-phase commit, a database that voted yes cannot decide alone. If the coordinator crashes after the votes, both databases wait with locks held and the orders behind them queue for as long as it is down.

## Model (`models/two-pc-crash.ts`)
- Five crash points: 0 nothing sent (A and B working), 1 both voted yes (both prepared), 2 decision logged, not sent (both prepared), 3 commit sent to Stock only (A committed, B prepared; B can ask A), 4 commit sent to both (both committed).
- Downtime stops: 5 s, 15 s, 30 s, 2 min, 10 min (log spaced).
- Orders waiting = 2 orders a second x downtime, when at least one database is prepared (points 1 to 3), else 0.
- Check points: 5 s 10, 15 s 30, 30 s 60, 2 min 240, 10 min 1,200.
- Default: point 1, 15 s.

## Inputs
Two snap rails inside the picture (`SnapStopsRail`, built on `TightRailSlider`): crash point with word labels, downtime. Keyboard: arrows, Home, End on each rail.

## What moves
Rail fill and knob show the crash. The two database cards change state (Working, Prepared, Committed) and show a padlock badge while prepared. The orders panel fills with red dots (one per order, up to 60; the number is the real count) and a stream of order dots flows toward a red wall when blocked, or through when not. At point 3 an "ask Stock" arrow runs from Payments to Stock.

## Verdicts (38 characters or fewer)
Point 0 "Safe: both can abort alone"; 1 "Both stuck with locks held"; 2 "Both stuck until it reads its log"; 3 "Payments waits, or asks Stock"; 4 "Nothing stuck: both committed".

## Accessibility
Both rails are `role="slider"` with `aria-valuetext`; the verdict is a live region; the SVG has a title and a description that restate the state. Reduced motion freezes the order stream; the picture still reflects the input.

## Primitive choice
The spec suggested `picture-slider.tsx` twice. One `PictureSlider` makes the whole picture a single drag surface, so two rails use `TightRailSlider` through the new data-driven `snap-stops-rail.tsx`.

## Source
S77. The 2 orders a second is a course example.
