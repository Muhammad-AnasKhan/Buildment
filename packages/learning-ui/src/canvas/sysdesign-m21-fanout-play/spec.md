# Canvas spec: sysdesign-m21-fanout-play

- **Course and chapter:** system-design, module 21 (news feed and timelines), chapter 21.3 beat 5, "Drag the line between push and pull". The signature playable of the module.
- **Renderer:** custom beat canvas on `BeatFrame`. The line is a single `role="slider"` built on `tight-rail-slider.tsx` with a hit zone that covers the five cards, the rail and its stop labels. Two gauges use the new data-driven `primitives/limit-gauge.tsx` (title, value, bar, limit marker, tone good or bad, dots that flow along the filled part). Pure model in `models/fanout-line.ts`, course numbers in `models/feed-numbers.ts`.
- **Claim:** Both extremes fail. Pushing every account needs twice the planned write capacity because a few huge accounts cause most writes. Pulling every account makes most feed opens meet a slow lookup. Only a line between them keeps both within limits, and it sits where the follower counts jump.

## Model

Five made-up groups (a composite shaped like a real social graph, no company's graph is claimed). Edges = accounts x followers; writes a day if pushed = accounts x posts a day x followers; follows per reader = edges / 100M.

| Group | Accounts | Followers each | Posts a day each | Writes a day if pushed | Follows per reader |
|---|---|---|---|---|---|
| Everyday | 80,000,000 | 100 | 0.11 | 0.88 B | 80 |
| Local | 4,000,000 | 1,000 | 0.25 | 1.00 B | 40 |
| Popular | 100,000 | 10,000 | 1 | 1.00 B | 10 |
| Big | 10,000 | 100,000 | 2 | 2.00 B | 10 |
| Celebrity | 1,000 | 1,000,000 | 4 | 4.00 B | 10 |

Let the pushed groups be those left of the line.

- Timeline writes a second at peak = (sum of writes a day over pushed groups) / 86,400 x 3.
- Share of plan = writes / 150,000 (the fleet is planned at half its 300,000 maximum).
- Lookups per feed open = 1 + follows per reader over pulled groups.
- Feed opens that meet a slow lookup = 1 - 0.99^lookups ([S8]).
- Limits: writes at most 150,000 a second; slow share at most 20%.
- Slowest post to land = followers of the biggest pushed account / 150,000 (20,000,000 for Celebrity).

| Line | Writes /s | Share of plan | Lookups | Slow share | Slowest post |
|---|---|---|---|---|---|
| Push everyone (default) | 308,333 | 206% | 1 | 1.0% | 133 s |
| Pull from Celebrity | 169,444 | 113% | 11 | 10.5% | 0.7 s |
| Pull from Big | 100,000 | 67% | 21 | 19.0% | 0.07 s |
| Pull from Popular | 65,278 | 44% | 31 | 26.8% | under 0.01 s |
| Pull from Local | 30,556 | 20% | 71 | 51.0% | under 0.01 s |
| Pull everyone | 0 | 0% | 151 | 78.1% | none |

Only "pull from Big" passes both limits (tested).

## Input

Six snap positions for the line. The value is the number of groups left of the line, so it reads like the picture: 0 pulls everyone (line at the far left), 5 pushes everyone (line at the far right, the default). The spec listed the positions from "push everyone" to "pull everyone", but cards on the right are pulled, so left to right on screen runs from "pull everyone" to "push everyone"; the order in the code follows the screen. Drag the line or tap anywhere on the cards or the rail, or use the arrow keys (one position), Home (pull everyone) and End (push everyone). No control outside the picture.

## Picture

Five group cards in a row (name, accounts, pill "push" or "pull"), a tick under each (100, 1K, 10K, 100K, 1M followers, a log axis). Pulled cards are tinted blue and say "pull". A vertical line stands in the gap between cards, with a knob on a rail below; the rail's stops are labelled "pull all", "pull 1K+", ..., "pull none". Under it: a write gauge (marker at 150,000, value and percent of plan) and a read gauge (marker at 20%, value and lookups per open). A bar is green within its limit and red over it, always with the verdict written. A caption gives the slowest post to land.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| writes over plan, slow share within limit | Writes too heavy: pull more accounts (bad) |
| slow share over 20%, writes within plan | Reads too slow: push more accounts (bad) |
| both over | Both over: widen the budget (bad; not reachable with these groups, kept for a changed model) |
| both within | Both within limits: the hybrid works (good) |

All 38 characters or fewer (tested).

## What the learner should notice

- The write bar falls fast as the first two groups (Celebrity, Big) are pulled, because 1,000 + 10,000 accounts cause 6 of the 8.88 billion daily writes.
- The read bar rises every time a group is pulled, slowly at first (10 lookups for each of the top three groups), then fast when Local and Everyday are pulled.
- One position passes both limits, and moving the line either way breaks one of them.

## Accessibility

- The line is a `role="slider"` with value text such as "pull accounts with 100,000 followers or more: 100,000 writes a second, 67 percent of plan, 21 lookups per feed open, 19 percent of feed opens meet a slow lookup". The verdict is also in a polite live region.
- Reduced motion: the knob, bars and tints update at once and no dots flow.
- Colour sits next to words (push/pull on the cards, the verdict, the values on the gauges).

## Sources

Arithmetic on course assumptions (chapter 21.3 fold). The slow-lookup probability 1 - 0.99^n is the tail-at-scale arithmetic [S8]. The groups are a made-up composite and no company's graph is claimed [S103].
