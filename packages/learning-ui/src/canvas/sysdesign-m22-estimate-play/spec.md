# Canvas spec: sysdesign-m22-estimate-play

- **Course and chapter:** system-design, module 22 (chat, presence and notifications), chapter 22.1 beat 2, "Drag the users, find the load".
- **Renderer:** custom beat canvas on `BeatFrame`, built on the existing `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) as in `sysdesign-m20-estimate-play`. Pure model in `models/dardasha-estimate.ts`, shared course numbers in `models/dardasha-numbers.ts`, number formats reused from `models/envelope-estimate.ts`.
- **Claim:** For a chat app, the open connections are the load that is easy to miss: messages a second can be modest while millions of lines need dozens of gateway servers. The ringed card is the number that drives the design.

## Model

| Quantity | Formula |
|---|---|
| Messages a day | users x messages per user |
| Messages a second, average | messages a day / 86,400 |
| Messages a second, peak | average x 3 (fixed assumption) |
| Deliveries a second, peak | peak x 3 recipients (fixed assumption) |
| Open lines | users x 1.5 devices x share online, rounded to a whole line |
| Gateways | ceil(open lines / 50,000) |
| Storage a year | messages a day x 365 x 300 B |

Default (the chapter): 10 million users, 40 messages each, 20% online gives 400 million a day, 4,630 /s average, 13,889 /s peak, 41,667 /s deliveries, 3.0 million lines, 60 gateways and 43.8 TB.

## Inputs

- Daily users: 1M, 5M, 10M, 25M, 50M (default 10M). The blue start card.
- Messages per user a day: 10, 20, 40, 80, 160 (default 40). A blue chip on the link from users to messages a day.
- Devices online at peak: 10%, 20%, 30% (default 20%). A blue chip on the link to open lines.
- Tap a blue number, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).
- Fixed and labelled "assumed" on their chips where they fit: the peak factor (x 3) and the recipients (x 3). The 1.5 devices, the 300 bytes and the 50,000 lines a gateway are written on their chips and in "What this picture leaves out". The first spec asked for four separate assumption cards; chips on the links keep the 420 wide picture readable, as in the Wasla estimate.

## Picture

Three chains from the same first card. Spine: Daily users, x messages, Messages a day, / 86,400 s, Messages a second (average), x 3 peak, Messages at peak, x 3 recipients, Deliveries at peak. Right: Daily users, x 1.5 x online, Open lines, / 50,000 lines, Gateways. Left: Messages a day, x 365 x 300 B, Storage a year. Dots flow along each link at a speed that grows with the log of the value the link leads to.

## Ring and verdicts

The ring (tone warn) goes on the open lines card when gateways are 20 or more, otherwise on the peak messages card when peak is 5,000 a second or more, otherwise on the storage card when storage is 10 TB a year or more, otherwise nowhere.

| Condition | Verdict (tone) |
|---|---|
| gateways 20 or more | Open connections drive it (warn) |
| peak 5,000 a second or more | Message rate drives it (warn) |
| storage 10 TB or more | Storage drives it (warn) |
| otherwise | One small cluster could serve this (good) |

All verdicts are 38 characters or fewer (tested across every input combination).

## What the learner should notice

- Messages a second stay modest; the open lines (3 million) are the surprise, and they need 60 gateways.
- Messages per user moves the message cards and storage but never the lines; devices online moves the lines but never the messages.
- At 1 million users with few messages, one small cluster could serve it.

## Accessibility

- Each input is a `role="slider"` (arrows, Home, End) with a value text such as "10 million daily users, 40 messages each, 3.0 million open lines, 60 gateways, 13,889 messages a second at peak, 43.8 terabytes a year". The ring is also written in the SVG description.
- Reduced motion: dots do not flow; the cards show their final values (the primitive draws still dots).
- Colour sits next to words (verdict, ring plus label).

## Sources

Arithmetic on course assumptions (chapter 2.3 for the method). No external source.
