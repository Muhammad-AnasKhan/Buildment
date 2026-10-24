# Canvas spec: sysdesign-m21-rank-play

- **Course and chapter:** system-design, module 21 (news feed and timelines), chapter 21.4 beat 2, "Drag how much age counts".
- **Renderer:** custom beat canvas on `BeatFrame`. Five post cards stacked in rank order that slide to their place with a 300 ms CSS transition; a formula strip of four chips; the half-life rail is `snap-stops-rail.tsx`. `primitives/sorter.tsx` is a card-sorting game and cannot reorder rows, so the stack is composed in the slug folder. Pure model in `models/rank-score.ts`.
- **Claim:** A ranking score mixes closeness, popularity and age. How fast age counts decides who leads: a short half-life puts fresh posts from close friends first, a long one lets old popular posts climb.

## Model

score = closeness x (1 + ln(1 + likes)) x 0.5^(age in hours / half-life in hours). Closeness runs from 0 to 1; `ln` is the natural logarithm. The five posts (made up):

| Post | Closeness | Likes | Age | Popularity term |
|---|---|---|---|---|
| Dina, close friend | 1.0 | 6 | 1 h | 2.95 |
| Karim, star | 0.5 | 400,000 | 20 h | 13.90 |
| Rafa Bakery | 0.3 | 40 | 5 h | 4.71 |
| Omar, cousin | 0.8 | 3 | 9 h | 2.39 |
| Daily News | 0.4 | 2,000 | 3 h | 8.60 |

| Half-life | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| 1 h | Dina 1.47 | News 0.43 | Bakery 0.04 | Omar 0.00 | Karim 0.00 |
| 3 h | Dina 2.34 | News 1.72 | Bakery 0.45 | Omar 0.24 | Karim 0.07 |
| 6 h (default) | Dina 2.62 | News 2.43 | Bakery 0.79 | Karim 0.69 | Omar 0.67 |
| 12 h | News 2.89 | Dina 2.78 | Karim 2.19 | Omar 1.14 | Bakery 1.06 |
| 24 h | Karim 3.90 | News 3.16 | Dina 2.86 | Omar 1.47 | Bakery 1.22 |
| 48 h | Karim 5.21 | News 3.29 | Dina 2.90 | Omar 1.68 | Bakery 1.32 |

All checked in tests against the formula.

## Input

Half-life on a rail inside the picture with snap points 1, 3, 6, 12, 24 and 48 hours (default 6). Drag, or use the arrow keys, Home and End. Tapping a card (a real button) selects it. No control outside the picture.

## Picture

A formula strip at the top: closeness, popularity and freshness chips joined by multiplication signs, then "= score", showing the factors of the selected post (default Dina). Under it, five cards in rank order: rank number, author with role, likes and age, a closeness chip, a score bar (full length is a score of 6) and the score. The cards keep their place in the markup and slide to their rank with a CSS transform transition, so the final order is visible even when the clock is paused. The leader has a blue rank badge and bar; the selected card is outlined.

## Verdicts

| Top post | Verdict (tone) |
|---|---|
| Dina | Fresh friends lead (good) |
| Daily News | Popular recent news leads (warn) |
| Karim | Old but popular posts climb (warn) |

All 38 characters or fewer.

## What the learner should notice

- Dina leads while age counts fast (1 to 6 hours) and slips to second at 12 hours.
- Karim, 20 hours old with 400,000 likes, is last at 1 hour and first at 24 hours.
- Tapping Karim at 6 hours shows why he is fourth: the age factor is 0.10 against 0.89 for Dina.

## Accessibility

- The rail is a `role="slider"` with value text such as "half-life 12 hours: Daily News first, then Dina, Karim, Omar, Bakery". The order is also an ordered list read by a screen reader (`sr-only`).
- Cards are buttons with labels such as "Dina, rank 1, score 2.62".
- Reduced motion: the cards jump to their new places with no slide.

## Sources

A course formula for teaching. Real rankers use trained models; the course makes no claim about any company's ranker (chapter 21.4 source note).
