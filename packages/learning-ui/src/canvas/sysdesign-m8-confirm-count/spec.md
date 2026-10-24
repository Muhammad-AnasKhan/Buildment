# Canvas spec: sysdesign-m8-confirm-count

- **Course and chapter:** system-design, 8.3 beat 3 ("How many followers must confirm?").
- **Renderer:** custom component on `BeatFrame` and `useBeatClock`, with `RailSlider` and `SliderRail` from the picture-slider family for the three-stop rail inside the picture. The timeline is custom drawing.
- **Claim:** each confirmation you wait for adds the round trip to a farther follower and buys one more copy at OK time. Asking for more confirmations than there are live followers stops writes.
- **Model (`model.ts`):** a leader and two followers, West (60 ms round trip, 30 ms one way) and EU (80 ms, 40 ms) [S3]; leader disk write with fsync 0.3 ms [S3]; 500 writes a second (made up). With k confirmations required (0 to 2):
  - write time = 0.3 ms + the k-th smallest round trip among live followers (0.3 ms when k = 0); fewer than k live followers: writes stall
  - copies at OK = 1 + k (copies the leader has heard confirmed; a follower may physically hold the write a little earlier)
  - writes at risk on a leader crash, only for k = 0: 500 x the smallest one-way delay of a live follower = 15 (West on) or 20 (West off)
  - worked values, both live: k = 0: 0.3 ms, 1 copy, 15 at risk; k = 1: 60.3 ms, 2 copies; k = 2: 80.3 ms, 3 copies. West off: k = 0: 20 at risk; k = 1: 80.3 ms; k = 2: stalled.
- **Inputs:** drag the rail inside the picture (snaps to 0, 1, 2; arrow keys, Home, End); outside the picture one toggle "West follower: on / off". Changing either restarts the sweep.
- **What moves:** a cursor sweeps the time axis; copy dots go out to each follower and the confirmations come back; the client's wait bar grows to the OK marker; the three copy tokens (leader, West, EU) light at the OK moment; a switched-off follower greys out and its copy dot ends in a cross and never returns. When stalled the bar runs to the end and no OK appears.
- **Verdicts:** "Fast, but 15 writes at risk" (20 with West off); "60 ms a write; survives 1 failure" (80 ms with West off); "80 ms a write; survives 2 failures"; "Writes stuck: not enough followers".
- **Deviations from the written spec:** the toggle is a `BeatButton` with `aria-pressed`, because `beat-frame.tsx` has no `BeatToggle`.
- **Accessibility:** the rail is a real `role="slider"` with `aria-valuetext` saying the verdict; the toggle is a button; the picture has a text summary; tone is always next to words.
- **Sources:** [S3] napkin-math round trips and the 0.3 ms fsync disk write; [S38] a synchronous commit waits at least one round trip and may never complete if a synchronous standby crashes.
