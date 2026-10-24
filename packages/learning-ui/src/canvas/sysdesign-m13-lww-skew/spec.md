# Canvas spec: sysdesign-m13-lww-skew

- **Course and chapter:** system-design, 13.5 ("Last write wins and lost data"), beat 3, "Drag the skew and count wrong winners".
- **Renderer:** custom beat canvas on `BeatFrame` with two `RailSlider`s drawn in the picture, `BeatChoice`, `DotGrid`, `VerdictBanner`.
- **Claim:** Last write wins compares stamps, so the write that really came later loses whenever the gap between the writes is smaller than the skew between the clocks. For concurrent writes one is always lost.
- **Model** (`model.ts`): write 1 on node A at 20 ms; A's clock is s ms ahead of B's. stamp1 = 20 + s/2; stamp2 = 20 + g - s/2. Sequential: write 2 wins when g > s, loses when g < s, ties at g = s. Concurrent: one write is lost in every pair. The counter plays 20 pairs (gaps 1 to 20).
- **Inputs:** skew rail 0, 2, 5, 10, 15, 20, 30 ms (default 20); gap rail 1 to 30 ms (default 5); both work with arrow keys. Outside the picture: Sequential | Concurrent.
- **Numbers to check** (tests): wrong winners (ties) at skew 0, 2, 5, 10, 15, 20, 30: 0 (0), 1 (1), 4 (1), 9 (1), 14 (1), 19 (1), 20 (0). Default: stamp1 = 30, stamp2 = 15, write 1 wins, "Later write lost: its clock ran slow".
- **Picture:** a real-time axis with the two writes (labels nudged apart when close), arrows down to the two stamp tags, the larger stamp crowned and marked "kept", the other "replaced" (correct), "lost" (wrong or concurrent) or both "tie"; a dot travels along each arrow; a row of 20 pair squares, red for a wrong winner, amber for a tie, the current gap outlined; the counter in words.
- **Reduced motion:** no travelling dots; markers and tags are drawn at their positions.
- **Accessibility:** each rail is a `role="slider"` ("skew 20 ms. 19 of 20 pairs have the wrong winner"); the counter sits in a polite live region.
- **Sources:** [S52], [S76].
