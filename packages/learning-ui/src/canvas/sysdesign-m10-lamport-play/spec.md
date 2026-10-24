# Canvas spec: sysdesign-m10-lamport-play

- **Course and chapter:** system-design, 10.3 ("Lamport clocks"), beat 4 "Predict each counter before it appears". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, the shared `lane-sequence` primitive (node cards, lifelines, event pills, message arrows), `SvgChip` for the actions and the guess chips, `VerdictBanner`, the beat clock for the shake and the flight.
- **Claim:** A receive sets the counter to the larger of the node's own value and the stamp, then adds 1; a counter never goes down.
- **Model** (`models/lamport-play.ts`): nodes A, B, C start at 0, 5, 0. A local event or a send adds 1 (a send attaches the new value as the stamp). A receive sets the counter to max(own, stamp) + 1, computed with `lamportTick` from the sim clocks.
- **Scripted run:** tap A and give it an event (A = 1); A sends to B (A = 2, stamp 2, B = max(5, 2) + 1 = 6); B sends to C (B = 7, C = 8); C sends to A (C = 9, A = max(2, 9) + 1 = 10); A sends to B (A = 11, B = max(7, 11) + 1 = 12). The hint names the next step; the run is free play at any time, and after the fifth step the banner says "Every receive lands after its send".
- **Inputs:** tap a node to choose it, then "Event on X" or "Send to Y" (tapping a second node sends at once). For a receive the learner taps a guess: own + 1, stamp + 1 or larger + 1 (two chips that give the same number merge). A wrong guess shakes and the banner says why; the right one flies to the receiver. "Start over" resets the run. A run is full after 30 actions.
- **Verdicts:** after a receive "Receiver was ahead: it only adds 1", "Receiver was behind: it jumps forward" or "Level with the stamp: it adds 1"; the formula "max(5, 2) + 1 = 6" sits in a pill under the lanes; after the fifth scripted step "Every receive lands after its send".
- **Accessibility:** cards and chips are real buttons (Enter and Space); the card's label says the counter and whether it is chosen.
- **Sources:** [S58] Lamport 1978 (IR1, IR2, the Clock Condition).
