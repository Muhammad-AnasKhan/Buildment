# Canvas spec: sysdesign-m21-action-map

- **Course and chapter:** system-design, module 21 (news feed and timelines), chapter 21.2 beat 5, "Tap an action, see what it touches".
- **Renderer:** custom beat canvas on `BeatFrame`. Eight `SvgNode` cards on a fixed grid, links drawn with `link-line.tsx`, four `SvgChip` action chips inside the picture, `VerdictBanner`. `block-map.tsx` selects a block, not an action, so it was not used; the map is composed from the same parts. Pure model in `models/feed-actions.ts`, course numbers in `models/feed-numbers.ts`.
- **Claim:** Each action in Hikaya touches a different set of blocks at a different rate. Opening the feed touches few blocks but very often; publishing touches the most blocks but least often, so the heavy work belongs on the write path where a queue can absorb bursts.

## Model

Peak rates from the chapter 21.1 numbers (50M daily users, x 3 peak, 86,400 s) with two more course assumptions: 5 profile views and 0.1 new follows per daily user per day.

| Action | Working | Rate |
|---|---|---|
| Open feed | 50,000,000 x 10 / 86,400 x 3 | 17,361 a second |
| Open profile | 50,000,000 x 5 / 86,400 x 3 | 8,681 a second |
| Publish a post | 50,000,000 x 0.2 / 86,400 x 3 | 347 a second |
| Follow | 50,000,000 x 0.1 / 86,400 x 3 | 174 a second, two writes each = 347 writes |

## Input

Tap one of four chips: Open feed (default), Open profile, Publish a post, Follow. The arrow keys, Home and End move between chips (a `role="group"` handler moves focus too). No control outside the picture.

## Picture

Eight blocks on a 3 by 4 grid: Gateway on top; Follow store, Feed service, Post service; Timelines, Post store, Queue; Fan-out at the bottom. Read side left, write side right. Links (in request direction): Gateway to Feed service, Post service and Follow store; Feed service to Timelines and Post store; Post service to Post store and Queue; Queue to Fan-out; Fan-out to Follow store (up the channel between the left and middle columns) and to Timelines. The Gateway to Follow store link is an addition to the spec's list, because the Follow action needs a path to the Follow store.

The chosen chip is filled. Touched blocks are full strength with a pill; untouched blocks are dimmed with no pill. Touched links are lit and carry dots at one of three speeds by the rate of the block they lead to (under 1,000, 1,000 to 10,000, over 10,000 a second). Two lines under the picture say what the pills count ("Each open reads 1 timeline, then 20 posts in one batch").

| Action | Pills (short unit on the card, full words for a screen reader) |
|---|---|
| Open feed | Gateway 17,361 /s; Feed service 17,361 /s; Timelines 17,361 reads/s; Post store 17,361 reads/s (batch of 20 posts, 347,000 posts) |
| Open profile | Gateway 8,681 /s; Post service 8,681 /s; Post store 8,681 reads/s (author index) |
| Publish a post | Gateway 347 /s; Post service 347 /s; Timelines 52,000 writes/s (warn, tag "21.3"); Post store 347 writes/s; Follow store 347 reads/s; Queue 347 events/s; Fan-out 347 jobs/s |
| Follow | Gateway 174 /s; Follow store 347 writes/s (two copies) |

Block labels on the cards are short (Feed API, Post API, Timelines, Post store, Fan-out) so they fit a 112 wide card; a screen reader gets the full names (Timeline cache and store, Post cache and store, Fan-out workers).

## Verdicts

| Action | Verdict (tone) |
|---|---|
| Open feed | Open feed: few blocks, very often (good) |
| Open profile | Open profile: one read path (good) |
| Publish a post | Publish: many blocks, 350 a second (warn) |
| Follow | Follow: two small writes (good) |

## What the learner should notice

- Opening the feed lights 4 blocks and runs fastest; publishing lights 7 and runs slowest.
- The Timelines pill under Publish is the one warning: 52,000 writes a second if every author had 150 followers. Chapter 21.3 shows that real follower counts make it worse.

## Accessibility

- Action chips are real buttons (`role="button"`, `aria-pressed`) with visible labels; arrow keys move between them. Each pill is also an item in a polite live list, such as "Timeline cache and store: 17,361 list reads a second".
- Reduced motion: dots become arrows on the lit links; the pills carry the rates (the spec asked for rates printed on the arrows; the pills already print them, so the arrows stay unlabelled to keep the picture clear).
- Colour sits next to words (pill text, verdict, "21.3" tag).

## Sources

Arithmetic on course assumptions (chapter 21.2 fold). No external source.
