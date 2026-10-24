# Canvas spec: sysdesign-m22-sequence-play

- **Course and chapter:** system-design, module 22, chapter 22.4 beat 2, "One counter per conversation sets the order".
- **Renderer:** custom beat canvas on `BeatFrame`. Pure model in `models/dardasha-order.ts`; the Send buttons use `primitives/svg-pill-button.tsx`, the delay rail `primitives/snap-stops-rail.tsx`, the toggle `primitives/beat-choice.tsx`.
- **Claim:** Two phones that sort by arrival time can disagree about the order of a chat when one path is slow. If every message carries a number from its conversation and a phone shows message n only after n - 1, all phones agree, at the price of a short wait when a message arrives early.

## Model

Each sender is 30 ms from the service; the service numbers by arrival (1 for the first sent, 2 for the second); the service is 40 ms from Layla for both. The first sent goes at 0 ms and the second at 100 ms. For Sami message 1 takes D ms and message 2 takes 40 ms. Arrival at Layla: message 1 at 70, message 2 at 170. Arrival at Sami: message 1 at 30 + D, message 2 at 170. By arrival Sami sees 2 before 1 when D is above 140. By number Sami holds message 2 for D - 140 ms when D is above 140.

| D (ms) | Layla by arrival | Sami by arrival | Agree by arrival | Sami by number | Message 2 held (ms) |
|---|---|---|---|---|---|
| 50 | 1, 2 | 1, 2 | yes | 1, 2 | 0 |
| 100 | 1, 2 | 1, 2 | yes | 1, 2 | 0 |
| 200 | 1, 2 | 2, 1 | no | 1, 2 | 60 |
| 500 | 1, 2 | 2, 1 | no | 1, 2 | 360 |
| 1000 | 1, 2 | 2, 1 | no | 1, 2 | 860 |

The snap points avoid D = 140, where the two arrivals tie. All five rows are tested.

## Inputs

- Two Send buttons inside the picture, under Dana and under Omar. The picture starts with both sent (Dana first). Tapping a Send button starts a new round with that sender first; the other button then asks to be tapped, and the second tap sends the second message 100 ms later. While only one has been sent the verdict says which Send to tap.
- Delay rail for the slow path to Sami (applies to the message sent first): 50, 100, 200, 500, 1000 ms (default 200).
- One toggle outside the picture, "Phones sort by": arrival or number (default arrival). One button: Replay.

## Picture

Dana and Omar on top with their Send buttons, the chat service in the middle as a panel with a numbered lane (no. 1, no. 2), Layla and Sami below, each with a two-row list. Dana's message is a circle, Omar's a rounded square. Dots fly along the paths in the time the story gives them (1 second on screen is 200 ms). In number mode a message that arrives early is a greyed row with the text "waits for no. 1" in the place it will take, and a chip on Sami says how long it was held.

## Verdicts

- `Phones disagree on the order` (arrival, D above 140; bad)
- `Same order, only by luck` (arrival, D below 140; warn)
- `Same order on every phone` (number; good)
- `Tap Send under {name}` (only one sender has tapped; accent)

## Accessibility

The Send buttons and the toggle are real buttons; the lists are `role="list"` with an aria-label such as "Sami's phone shows: Omar's message, then Dana's"; the rail's value text repeats the list.

## Reduced motion

The lists show their final state at once; the hold is written as text.

## Sources

None needed (course model). Chapters 10.1 and 10.3 for the ordering ideas.
