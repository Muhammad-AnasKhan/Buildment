# Canvas spec: sysdesign-m12-quorum-explorer

- **Course and chapter:** system-design, 12.3 ("Quorums"), beat 2 "Move N, W and R, find the gaps". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`: `DotGrid`, `VerdictBanner`, round copy tokens drawn like the house cards (nine do not fit as 112 wide `SvgNode` cards), `SvgButton` taps, three snap rails on `TightRailSlider` (new primitive: a role="slider" hit zone you size yourself, so rails can sit 46 units apart).
- **Claim:** A read group and a write group must share a copy exactly when W + R is more than N. The same choice sets how many failures reads and writes survive, and how slow they are.
- **Model** (`models/quorum-explorer.ts`):
  - majority(N) = floor(N / 2) + 1. N is 3, 5, 7 or 9 (default 5); W and R run from 1 to N (defaults 3 and 3) and are clamped when N changes.
  - Response times in ms, fastest first: 10, 15, 25, 40, 70, 120, 200, 300, 500. The first N are used.
  - Write group = the W fastest copies that are up. Read group, for the picture, = the R slowest copies that are up, so the two groups are as far apart as they can be. Shared = the copies in both.
  - Overlap is guaranteed when W + R > N, with at least W + R - N shared copies. Writes survive N - W failures, reads N - R.
  - Write time = response time of the W-th fastest copy that is up, or blocked when fewer than W are up. Read time likewise with R.
- **Inputs:** three rails (N, W, R), each also a keyboard slider (arrow keys step one value, Home and End jump to the ends). Tap a copy (44 wide target) to fail it or bring it back.
- **Picture:** copies in a row, fastest left, each with its ms label. Write group ringed blue, read group ringed amber, shared copies filled green with a check, failed copies grey with a cross. When W + R is at most N, a dashed gap marker (when the groups sit apart) and a tag "a read can miss a write" appear. Three pills: "writes survive 2", "reads survive 2", "write 25 ms, read 25 ms". Ambient motion: a ping ring leaves each grouped copy when it answers, slow copies later (loop of 3.2 s); with reduced motion there are no pings and the rings and pills tell the whole story.
- **Verdicts** (at most 38 characters; blocked wins): "Writes blocked: too few nodes up", "Reads blocked: too few nodes up", "Overlap: every read meets a write", "No overlap: a read can miss a write".
- **Checks:** the eight rows of the spec table are unit tests (3/2/2, 3/1/3, 3/1/1, 5/3/3, 5/2/3, 5/1/5, 5/5/1, 9/5/5), plus N = 5, W = 3, R = 3 with copies 4 and 5 failed (both work, 25 ms) and with copy 3 also failed (both blocked).
- **Accessibility:** each rail is a slider with a value text ("write waits for 3 of 5, survives 2 failures"); each copy is a button ("replica 3, 25 ms, up; press to fail"); the verdict is a live region.
- **Sources:** R + W > N and latency set by the slowest replica [S45]; majority [S52]. Response times are course numbers.
